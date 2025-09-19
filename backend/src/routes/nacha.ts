import express from 'express';
import Joi from 'joi';
import { DatabaseService } from '@/services/databaseService';
import { EncryptionService } from '@/services/encryptionService';
import { BusinessDayService } from '@/services/businessDayService';
import { NACHAService } from '@/services/nachaService';
import { ACHTransaction, TransactionStatus, ApiResponse } from '@/types';
import { authMiddleware, requireOperator } from '@/middleware/auth';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Generate NACHA files for a specific effective date
router.post('/generate', requireOperator, async (req, res) => {
  try {
    const generateSchema = Joi.object({
      effectiveDate: Joi.date().required(),
      fileType: Joi.string().valid('DR', 'CR').required()
    });

    const { error, value } = generateSchema.validate(req.body);
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0].message
      };
      return res.status(400).json(response);
    }

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const encryptionService: EncryptionService = req.app.locals.encryptionService;
    const businessDayService: BusinessDayService = req.app.locals.businessDayService;
    const nachaService: NACHAService = req.app.locals.nachaService;

    const { effectiveDate, fileType } = value;

    // Calculate the appropriate effective date based on file type
    let targetEffectiveDate = new Date(effectiveDate);
    if (fileType === 'CR') {
      // Credit files should be 2 business days after debit effective date
      targetEffectiveDate = businessDayService.getCreditEffectiveDate(targetEffectiveDate);
    }

    // Get transactions for the effective date
    const transactionsResult = await databaseService.getTransactions(1, 1000, {
      effectiveDate: targetEffectiveDate,
      status: TransactionStatus.PENDING
    });

    if (!transactionsResult.data || transactionsResult.data.length === 0) {
      const response: ApiResponse = {
        success: false,
        error: `No pending transactions found for effective date ${targetEffectiveDate.toISOString().split('T')[0]}`
      };
      return res.status(404).json(response);
    }

    // Decrypt account numbers for NACHA file generation
    const decryptedTransactions: ACHTransaction[] = transactionsResult.data.map(tx => {
      const drAccountNumber = encryptionService.decrypt(tx.drAccountNumberEncrypted);
      const crAccountNumber = encryptionService.decrypt(tx.crAccountNumberEncrypted);
      
      return {
        ...tx,
        drAccountNumber,
        crAccountNumber
      } as ACHTransaction;
    });

    // Generate NACHA file with encryption
    const nachaFile = nachaService.generateSecureNACHAFile(
      decryptedTransactions,
      targetEffectiveDate,
      fileType
    );

    // Save NACHA file to database
    const savedNachaFile = await databaseService.createNACHAFile({
      filename: nachaFile.filename,
      content: nachaFile.content,
      effectiveDate: nachaFile.effectiveDate,
      transactionCount: nachaFile.transactionCount,
      totalAmount: nachaFile.totalAmount,
      transmitted: false
    });

    // Update transaction status to processed
    await Promise.all(
      decryptedTransactions.map(tx => 
        databaseService.updateTransactionStatus(tx.id, TransactionStatus.PROCESSED)
      )
    );

    // Increment NACHA service sequence number
    nachaService.incrementSequenceNumber();

    const response: ApiResponse = {
      success: true,
      data: {
        id: savedNachaFile.id,
        filename: savedNachaFile.filename,
        effectiveDate: savedNachaFile.effectiveDate,
        transactionCount: savedNachaFile.transactionCount,
        totalAmount: savedNachaFile.totalAmount,
        createdAt: savedNachaFile.createdAt
      },
      message: `NACHA ${fileType} file generated successfully`
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Generate NACHA file error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to generate NACHA file'
    };
    return res.status(500).json(response);
  }
});

// Get all NACHA files
router.get('/files', async (req, res) => {
  try {
    const querySchema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(50)
    });

    const { error, value } = querySchema.validate(req.query);
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: error.details[0].message
      };
      return res.status(400).json(response);
    }

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const result = await databaseService.getNACHAFiles(value.page, value.limit);

    // Remove file content from list view for performance
    const filesWithoutContent = result.data!.map(file => ({
      ...file,
      content: undefined
    }));

    const response: ApiResponse = {
      success: true,
      data: filesWithoutContent,
      pagination: result.pagination
    };

    return res.json(response);
  } catch (error) {
    console.error('Get NACHA files error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve NACHA files'
    };
    return res.status(500).json(response);
  }
});

// Get a specific NACHA file by ID
router.get('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const nachaFile = await databaseService.getNACHAFile(id);

    if (!nachaFile) {
      const response: ApiResponse = {
        success: false,
        error: 'NACHA file not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse = {
      success: true,
      data: nachaFile
    };

    return res.json(response);
  } catch (error) {
    console.error('Get NACHA file error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve NACHA file'
    };
    return res.status(500).json(response);
  }
});

// Download a NACHA file
router.get('/files/:id/download', async (req, res) => {
  try {
    const { id } = req.params;

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const nachaService: NACHAService = req.app.locals.nachaService;
    const nachaFile = await databaseService.getNACHAFile(id);

    if (!nachaFile) {
      const response: ApiResponse = {
        success: false,
        error: 'NACHA file not found'
      };
      return res.status(404).json(response);
    }

    // Get the actual content (decrypt if necessary)
    const actualContent = nachaService.getNACHAFileContent(nachaFile.content);

    // Set headers for file download
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${nachaFile.filename}"`);
    
    return res.send(actualContent);
  } catch (error) {
    console.error('Download NACHA file error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to download NACHA file'
    };
    return res.status(500).json(response);
  }
});

// Validate a NACHA file
router.post('/files/:id/validate', async (req, res) => {
  try {
    const { id } = req.params;

    const databaseService: DatabaseService = req.app.locals.databaseService;
    const nachaService: NACHAService = req.app.locals.nachaService;

    const nachaFile = await databaseService.getNACHAFile(id);

    if (!nachaFile) {
      const response: ApiResponse = {
        success: false,
        error: 'NACHA file not found'
      };
      return res.status(404).json(response);
    }

    const validation = nachaService.validateNACHAFileComplete(nachaFile.content);

    const response: ApiResponse = {
      success: true,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        filename: nachaFile.filename,
        isEncrypted: validation.isEncrypted,
        integrityValid: validation.integrityValid,
        metadata: validation.metadata
      }
    };

    return res.json(response);
  } catch (error) {
    console.error('Validate NACHA file error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to validate NACHA file'
    };
    return res.status(500).json(response);
  }
});

// Mark NACHA file as transmitted
router.patch('/files/:id/transmitted', requireOperator, async (req, res) => {
  try {
    const { id } = req.params;

    const databaseService: DatabaseService = req.app.locals.databaseService;

    // Check if file exists
    const nachaFile = await databaseService.getNACHAFile(id);
    if (!nachaFile) {
      const response: ApiResponse = {
        success: false,
        error: 'NACHA file not found'
      };
      return res.status(404).json(response);
    }

    await databaseService.updateNACHAFileTransmissionStatus(id, true);

    const response: ApiResponse = {
      success: true,
      message: 'NACHA file marked as transmitted'
    };

    return res.json(response);
  } catch (error) {
    console.error('Update NACHA file transmission status error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to update NACHA file transmission status'
    };
    return res.status(500).json(response);
  }
});

// Get NACHA generation statistics
router.get('/stats/generation', async (req, res) => {
  try {
    const databaseService: DatabaseService = req.app.locals.databaseService;

    // Get all NACHA files for statistics
    const allFiles = await databaseService.getNACHAFiles(1, 1000);
    
    const stats = {
      totalFiles: allFiles.data?.length || 0,
      transmittedFiles: allFiles.data?.filter(file => file.transmitted).length || 0,
      pendingFiles: allFiles.data?.filter(file => !file.transmitted).length || 0,
      totalTransactionCount: allFiles.data?.reduce((sum, file) => sum + file.transactionCount, 0) || 0,
      totalAmount: allFiles.data?.reduce((sum, file) => sum + file.totalAmount, 0) || 0,
      averageFileSize: allFiles.data?.length ? 
        (allFiles.data.reduce((sum, file) => sum + file.transactionCount, 0) / allFiles.data.length) : 0
    };

    const response: ApiResponse = {
      success: true,
      data: stats
    };

    return res.json(response);
  } catch (error) {
    console.error('Get NACHA generation stats error:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Failed to retrieve NACHA generation statistics'
    };
    return res.status(500).json(response);
  }
});

export { router as nachaRouter };