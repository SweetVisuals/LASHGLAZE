import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kzmxzudtbfgpvkdctwcw.supabase.co';
const supabaseKey = 'sb_publishable_-R6PRXguQygWGO_DBi8y6A_dzSpIOmV';

export const supabase = createClient(supabaseUrl, supabaseKey);
