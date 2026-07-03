import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = !!(supabaseUrl && supabaseAnonKey && (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) && !supabaseUrl.includes('placeholder'));

const realClient = isConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

// Memory-safe storage helpers to bypass localStorage 5MB quota limits (e.g. for large Base64 images)
const getMockData = (table: string): any[] => {
  if (!(window as any).__mock_supabase_cache) {
    (window as any).__mock_supabase_cache = {};
  }
  if ((window as any).__mock_supabase_cache[table]) {
    return (window as any).__mock_supabase_cache[table];
  }
  try {
    const dataStr = localStorage.getItem(`mock_supabase_${table}`);
    if (dataStr) {
      const parsed = JSON.parse(dataStr);
      (window as any).__mock_supabase_cache[table] = parsed;
      return parsed;
    }
  } catch (err) {
    console.warn(`[Supabase Mock] Failed to read ${table} from localStorage:`, err);
  }
  return [];
};

const saveMockData = (table: string, data: any[]) => {
  if (!(window as any).__mock_supabase_cache) {
    (window as any).__mock_supabase_cache = {};
  }
  (window as any).__mock_supabase_cache[table] = data;
  try {
    localStorage.setItem(`mock_supabase_${table}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`[Supabase Mock] localStorage quota exceeded for table "${table}". Storing in memory fallback instead.`, err);
  }
};

// Safe mock proxy client that falls back to localStorage if credentials are not provided
export const supabase = new Proxy({} as any, {
  get(target, prop) {
    if (realClient) {
      const val = (realClient as any)[prop];
      if (typeof val === 'function') {
        return val.bind(realClient);
      }
      return val;
    }

    // Mock implementation for fallback
    if (prop === 'auth') {
      return {
        getUser: async () => {
          return { data: { user: null }, error: null };
        },
        getSession: async () => {
          return { data: { session: null }, error: null };
        },
        onAuthStateChange: () => {
          return { data: { subscription: { unsubscribe: () => {} } } };
        }
      };
    }

    const createQueryChain = (data: any) => {
      const result = { data, error: null };
      const chain = {
        then: (onfulfilled?: (value: any) => any) => {
          return Promise.resolve(result).then(onfulfilled);
        },
        single: () => {
          const first = Array.isArray(data) ? (data[0] || null) : data;
          return createQueryChain(first);
        },
        order: () => {
          return createQueryChain(data);
        },
        eq: (col: string, val: any) => {
          if (Array.isArray(data)) {
            const filtered = data.filter(item => item[col] === val);
            return createQueryChain(filtered);
          }
          if (data && data[col] === val) {
            return createQueryChain(data);
          }
          return createQueryChain(null);
        },
        limit: () => {
          return createQueryChain(data);
        }
      };
      return chain;
    };

    if (prop === 'from') {
      return (table: string) => {
        return {
          insert: async (data: any) => {
            console.log(`[Supabase Mock] Insert into ${table}:`, data);
            try {
              const existing = getMockData(table);
              const newRecord = { ...data, id: data.id || Math.random().toString(), created_at: new Date().toISOString() };
              existing.push(newRecord);
              saveMockData(table, existing);
              return { data: newRecord, error: null };
            } catch (err) {
              console.error(err);
              return { data, error: err as any };
            }
          },
          select: () => {
            const existing = getMockData(table);
            return createQueryChain(existing);
          },
          delete: () => {
            return {
              eq: (col: string, val: any) => {
                console.log(`[Supabase Mock] Delete from ${table} where ${col} = ${val}`);
                try {
                  const existing = getMockData(table);
                  const filtered = existing.filter((item: any) => item[col] !== val);
                  saveMockData(table, filtered);
                } catch (err) {
                  console.error(err);
                }
                return createQueryChain([]);
              }
            };
          },
          update: (updateData: any) => {
            return {
              eq: (col: string, val: any) => {
                console.log(`[Supabase Mock] Update ${table} set`, updateData, `where ${col} = ${val}`);
                try {
                  let existing = getMockData(table);
                  let updated = false;
                  existing = existing.map((item: any) => {
                    if (item[col] === val) {
                      updated = true;
                      return { ...item, ...updateData };
                    }
                    return item;
                  });
                  if (!updated) {
                    existing.push({ ...updateData, [col]: val, id: Math.random().toString(), created_at: new Date().toISOString() });
                  }
                  saveMockData(table, existing);
                } catch (err) {
                  console.error(err);
                }
                return createQueryChain(updateData);
              }
            };
          },
          upsert: async (upsertData: any) => {
            console.log(`[Supabase Mock] Upsert into ${table}:`, upsertData);
            try {
              let existing = getMockData(table);
              const dataArray = Array.isArray(upsertData) ? upsertData : [upsertData];
              
              dataArray.forEach((item: any) => {
                const idx = existing.findIndex((x: any) => x.id === item.id || (item.key && x.key === item.key));
                if (idx > -1) {
                  existing[idx] = { ...existing[idx], ...item };
                } else {
                  existing.push({ ...item, id: item.id || Math.random().toString(), created_at: new Date().toISOString() });
                }
              });
              
              saveMockData(table, existing);
              return { data: upsertData, error: null };
            } catch (err) {
              console.error(err);
              return { data: null, error: err as any };
            }
          }
        };
      };
    }

    if (prop === 'storage') {
      return {
        createBucket: async (bucketName: string, options?: any) => {
          console.log(`[Supabase Mock] Create bucket "${bucketName}":`, options);
          return { data: { name: bucketName }, error: null };
        },
        from: (bucket: string) => {
          return {
            upload: async (filePath: string, file: File | Blob) => {
              console.log(`[Supabase Mock] Uploading file to storage bucket "${bucket}" path "${filePath}"`);
              return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64data = reader.result as string;
                  try {
                    localStorage.setItem(`mock_storage_${bucket}_${filePath}`, base64data);
                  } catch (e) {
                    console.log("[Supabase Mock] Base64 too large for localStorage, storing in memory instead.");
                    (window as any)[`mock_storage_${bucket}_${filePath}`] = base64data;
                  }
                  resolve({ data: { path: filePath }, error: null });
                };
                reader.onerror = () => {
                  resolve({ data: null, error: new Error("Upload failed") });
                };
                reader.readAsDataURL(file);
              });
            },
            getPublicUrl: (filePath: string) => {
              const base64 = localStorage.getItem(`mock_storage_${bucket}_${filePath}`) || (window as any)[`mock_storage_${bucket}_${filePath}`];
              return {
                data: {
                  publicUrl: base64 || filePath
                }
              };
            }
          };
        }
      };
    }

    return undefined;
  }
}) as unknown as ReturnType<typeof createClient>;
