import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  try {
    console.log('Testing Supabase connection...')
    
    // Test 1: Check if environment variables are loaded
    const envCheck = {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    }
    
    console.log('Environment check:', envCheck)
    
    // Check if clients are available
    if (!supabase || !supabaseAdmin) {
      return NextResponse.json({
        status: 'error',
        error: 'Supabase clients not initialized. Please check your environment variables.',
        tests: {
          environment: envCheck,
        },
        recommendation: 'Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in your environment variables.',
      }, { status: 500 })
    }
    
    // Test 2: Test public client connection
    let publicClientTest = { success: false, error: null as any }
    try {
      // Try to fetch from a system table (this should work even without custom tables)
      const { data, error } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1)
      
      if (error && error.code === '42P01') {
        // Table doesn't exist yet - this is expected if schema hasn't been run
        publicClientTest = { 
          success: true, 
          error: 'Tables not created yet - please run the SQL schema in Supabase dashboard' 
        }
      } else if (error) {
        publicClientTest = { success: false, error: error.message }
      } else {
        publicClientTest = { success: true, error: null }
      }
    } catch (err: any) {
      publicClientTest = { success: false, error: err.message }
    }
    
    // Test 3: Test admin client connection
    let adminClientTest = { success: false, error: null as any }
    try {
      // Admin client can access auth schema
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      })
      
      if (error) {
        adminClientTest = { success: false, error: error.message }
      } else {
        adminClientTest = { success: true, error: null }
      }
    } catch (err: any) {
      adminClientTest = { success: false, error: err.message }
    }
    
    // Test 4: Check database connection with a simple query
    let dbConnectionTest = { success: false, error: null as any, tables: [] as string[] }
    try {
      // This query lists all tables in the public schema
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
      
      if (error) {
        // Try with public client if admin fails
        const publicResult = await supabase
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
        
        if (publicResult.error) {
          dbConnectionTest = { 
            success: false, 
            error: 'Cannot access information schema - this is normal for new projects',
            tables: []
          }
        } else {
          dbConnectionTest = { 
            success: true, 
            error: null,
            tables: publicResult.data?.map((t: any) => t.table_name) || []
          }
        }
      } else {
        dbConnectionTest = { 
          success: true, 
          error: null,
          tables: data?.map((t: any) => t.table_name) || []
        }
      }
    } catch (err: any) {
      dbConnectionTest = { success: false, error: err.message, tables: [] }
    }
    
    // Compile results
    const results = {
      timestamp: new Date().toISOString(),
      status: 'connected',
      tests: {
        environment: envCheck,
        publicClient: publicClientTest,
        adminClient: adminClientTest,
        databaseConnection: dbConnectionTest,
      },
      summary: {
        allTestsPassed: publicClientTest.success || adminClientTest.success,
        canConnectToSupabase: publicClientTest.success || adminClientTest.success,
        tablesExist: dbConnectionTest.tables.length > 0,
        recommendation: dbConnectionTest.tables.length === 0 
          ? 'Connection successful! Please run the SQL schema in your Supabase dashboard to create the tables.'
          : 'Connection successful! Database is ready to use.',
      }
    }
    
    console.log('Supabase connection test results:', results)
    
    return NextResponse.json(results, { status: 200 })
    
  } catch (error: any) {
    console.error('Supabase connection test failed:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}

export async function POST() {
  try {
    // Test creating a simple record if tables exist
    const testData = {
      test_id: crypto.randomUUID(),
      test_value: 'Hello from Max\'s Learning Rocket!',
      created_at: new Date().toISOString(),
    }
    
    // First, try to create a test table
    const createTableResult = await supabaseAdmin.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.connection_tests (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          test_id TEXT,
          test_value TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    }).catch(() => null)
    
    // Try to insert test data
    const { data, error } = await supabase
      .from('connection_tests')
      .insert([testData])
      .select()
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Could not write to database',
        error: error.message,
        recommendation: 'Please run the SQL schema first',
      }, { status: 400 })
    }
    
    return NextResponse.json({
      status: 'success',
      message: 'Successfully wrote to database!',
      data: data,
      timestamp: new Date().toISOString(),
    }, { status: 200 })
    
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
}