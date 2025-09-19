import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;

export class DatabaseService {
  private supabase;

  constructor() {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  // Generic query method
  async query(sql: string, params: any[] = []) {
    try {
      // This is a simplified implementation
      // In practice, you'd need to handle parameterized queries properly
      const { data, error } = await this.supabase.rpc('execute_sql', { 
        sql_query: sql,
        params: params 
      });
      
      if (error) {
        throw error;
      }
      
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  // Specific methods for common operations
  async select(table: string, conditions: any = {}) {
    let query = this.supabase.from(table).select('*');
    
    Object.keys(conditions).forEach(key => {
      query = query.eq(key, conditions[key]);
    });
    
    return await query;
  }

  async insert(table: string, data: any) {
    return await this.supabase.from(table).insert(data);
  }

  async update(table: string, data: any, conditions: any) {
    let query = this.supabase.from(table).update(data);
    
    Object.keys(conditions).forEach(key => {
      query = query.eq(key, conditions[key]);
    });
    
    return await query;
  }

  async delete(table: string, conditions: any) {
    let query = this.supabase.from(table).delete();
    
    Object.keys(conditions).forEach(key => {
      query = query.eq(key, conditions[key]);
    });
    
    return await query;
  }
}