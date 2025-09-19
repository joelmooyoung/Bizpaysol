# Bizpaysol - ACH Processing System

Bizpaysol is an ACH (Automated Clearing House) payment processing system. The repository is currently in early development stage with minimal code structure.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Repository Status
- **CURRENT STATE**: Repository contains only README.md - no build system or code exists yet
- **TECHNOLOGY STACK**: Not yet determined - will likely be Node.js, .NET, Java, or Python based on ACH processing requirements
- **BUILD STATUS**: No build system configured yet

## Working Effectively

### Initial Repository Setup
Always start with these commands to verify your environment:

```bash
cd /home/runner/work/Bizpaysol/Bizpaysol
git --no-pager status
git --no-pager log --oneline -5
ls -la
```

### Available Development Tools
The following tools are pre-installed and validated:
- Git: 2.51.0
- Node.js: v20.19.5
- npm: 10.8.2
- Python 3: 3.12.3
- .NET: 8.0.119
- Java: OpenJDK 17.0.16

### Repository Structure
```
/home/runner/work/Bizpaysol/Bizpaysol/
├── .git/
├── .github/
│   └── copilot-instructions.md (this file)
└── README.md
```

## Build and Development Instructions

### CRITICAL: Current Limitations
- **NO BUILD SYSTEM EXISTS YET** - Do not attempt to run build commands until a project structure is established
- **NO TESTS EXIST YET** - Do not attempt to run test commands
- **NO DEPENDENCIES DEFINED** - Do not run npm install, pip install, or dotnet restore until project files are created

### When Code is Added
Once the project structure is established, follow these patterns:

#### For Node.js Projects:
```bash
# NEVER CANCEL: npm install can take 5-15 minutes depending on dependencies
npm install  # Set timeout to 30+ minutes
# NEVER CANCEL: Build process may take 10-30 minutes for large projects
npm run build  # Set timeout to 60+ minutes
# NEVER CANCEL: Test suites may take 5-20 minutes
npm run test  # Set timeout to 45+ minutes
npm run lint
```

#### For .NET Projects:
```bash
# NEVER CANCEL: Package restore can take 5-10 minutes
dotnet restore  # Set timeout to 30+ minutes
# NEVER CANCEL: Build process may take 10-45 minutes for large solutions
dotnet build  # Set timeout to 60+ minutes
# NEVER CANCEL: Test execution may take 5-30 minutes
dotnet test  # Set timeout to 45+ minutes
```

#### For Java Projects:
```bash
# NEVER CANCEL: Maven/Gradle operations can take 10-30 minutes
./mvnw clean install  # Set timeout to 60+ minutes
# OR for Gradle:
./gradlew build  # Set timeout to 60+ minutes
# NEVER CANCEL: Test execution may take 10-30 minutes
./mvnw test  # Set timeout to 45+ minutes
```

#### For Python Projects:
```bash
# NEVER CANCEL: Package installation can take 5-15 minutes
pip install -r requirements.txt  # Set timeout to 30+ minutes
# NEVER CANCEL: Test execution may take 5-20 minutes
python -m pytest  # Set timeout to 45+ minutes
```

## Validation Requirements

### Manual Testing Requirements
**CRITICAL**: After making any changes, you MUST perform manual validation:

1. **Repository Operations**: Verify git commands work correctly
2. **File Operations**: Ensure new files are properly created and formatted
3. **Build Validation**: Once build system exists, ensure complete build succeeds
4. **Functionality Testing**: Test core ACH processing workflows when implemented

### Pre-commit Validation
Always run these commands before committing (once they exist):
```bash
# Set appropriate timeouts based on project type
npm run lint  # For Node.js projects
dotnet format  # For .NET projects  
black . && flake8  # For Python projects
```

## ACH Processing Domain Knowledge

### Key Concepts to Understand
- **ACH Files**: Standard format for electronic payments
- **NACHA Rules**: Regulatory compliance requirements
- **Batch Processing**: ACH transactions are processed in batches
- **Settlement**: T+1 or T+2 settlement cycles
- **Return Codes**: Standard ACH return reason codes

### Security Considerations
- **PCI DSS Compliance**: Required for payment processing
- **Encryption**: All sensitive data must be encrypted
- **Audit Trails**: Complete transaction logging required
- **Access Controls**: Role-based access for payment operations

## Common Development Patterns

### File Structure Expectations
When the project grows, expect these patterns:
```
src/
├── ach/           # Core ACH processing logic
├── api/           # REST API endpoints
├── models/        # Data models and schemas
├── services/      # Business logic services
├── utils/         # Utility functions
└── tests/         # Test files
config/            # Configuration files
docs/              # Documentation
scripts/           # Build and deployment scripts
```

### Testing Strategy
- **Unit Tests**: Test individual ACH processing functions
- **Integration Tests**: Test complete payment workflows
- **Compliance Tests**: Validate NACHA rule compliance
- **Performance Tests**: Ensure batch processing speed requirements

## Troubleshooting

### Common Issues
1. **"No build system found"**: This is expected currently - project structure needs to be established first
2. **Permission errors**: Ensure proper file permissions in /home/runner/work/Bizpaysol/Bizpaysol
3. **Timeout errors**: Always use extended timeouts for build operations (60+ minutes)

### When Adding New Features
1. **Always read ACH specifications** before implementing payment logic
2. **Follow financial regulations** - compliance is critical
3. **Implement comprehensive logging** for audit requirements
4. **Add security validations** for all user inputs
5. **Test with sample ACH files** before processing real data

## Development Workflow

### Making Changes
1. Always validate current repository state first
2. Create feature branches for new functionality
3. Implement with security and compliance in mind
4. Add comprehensive tests (unit, integration, compliance)
5. Validate manually with representative test data
6. Run all linting and formatting tools
7. Ensure no sensitive data is committed

### Performance Considerations
- **ACH batch processing** can handle thousands of transactions
- **File I/O operations** may be bottlenecks with large ACH files
- **Database operations** need optimization for high transaction volumes
- **Memory management** is critical for large batch processing

## Emergency Procedures

### If Build Fails
1. Check for recent changes to project files (package.json, *.csproj, etc.)
2. Verify all dependencies are properly installed
3. Check for breaking changes in external dependencies
4. Review error logs for specific failure points
5. NEVER force-push or reset - preserve debugging information

### If Tests Fail
1. Determine if failures are related to your changes
2. Run tests individually to isolate problems
3. Check for environmental issues (timeouts, permissions)
4. Validate test data and mock configurations
5. Ensure compliance test data meets NACHA standards

Remember: ACH processing requires extreme accuracy and compliance. When in doubt, consult financial processing documentation and err on the side of caution.