'use client';

import React, {useState} from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handAuthAction = async(e: React.FormEvent<HTMLFormElement>, type: 'SIGN_IN' | 'SIGN_UP') => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (type === 'SIGN_UP') {
      const {data, error} = await supabase.auth.signUp({email, password});
      if (error) {
        setMessage(`❌ Authentication Error: ${error.message}`); 
      }
      else if (data.user) {
        setMessage('✅ Success! Account Registered successfully')
      }
    };

    if (type === 'SIGN_IN') {
      const {data, error} = await supabase.auth.signInWithPassword({email, password});
      if (error) {
        setMessage(`❌ Authentication Failed: ${error.message}`);
      }
      else if (data.user) {
        setMessage('✅Logging successfully, directing you to account dashboard.....')
        router.push('/dashboard');
      }
    };
    setLoading(false);
  };


  return(
    <div className='flex flex-col items-center justify-center min-h-screen  bg-gray-50 '>
      <div className='rounded-xl p-10  bg-gray-100 shadow-xl border border-gray-200 space-y-6 w-full max-w-md pt-6 '>
        <h2 className='font-extrabold text-2xl text-center tracking-tight text-emerald-500 uppercase '>
           ✈ First Bank Pls
        </h2>
        <p className='text-center text-medium text-gray-500 block'>
          Enter your credentials to security access your ledger accounts.
        </p>
        <form onSubmit={(e)=> handAuthAction(e, 'SIGN_IN')} className='space-y-4 mt-2'>
          <div>
            <label className='font-medium text-gray-700 mb-1 text-sm'>Email Address</label>
            <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                placeholder='sample@gmail.com'
                className='w-full rounded-xl py-2 px-3 focus:ring-2 focus:outline-none focus:ring-blue-200 border border-blue-200 ' required>
            </input> 
          </div>
          <div>
             <label className='font-medium text-gray-700 mb-1 text-sm'>Password</label>
             <input 
                type='password'
                value={password}
                onChange={(e)=> setPassword(e.target.value)} 
                placeholder='••••••••'
                className='w-full rounded-xl py-2 px-3 focus:ring-2 focus:outline-none focus:ring-blue-200 border border-blue-200' required>
              </input>
          </div>
          {message &&(
            <p className='text-sm text-red-400 text-center font-medium px-2'>
              {message}
            </p>
          )}
          <div className='flex flex-col gap-4 pt-2'>
            <button
              type="submit"
              disabled={loading}
              className="
                w-full px-4 py-3 
                text-base font-semibold text-white 
                bg-blue-600 hover:bg-blue-700 active:bg-blue-800
                rounded-xl shadow-sm
                transition-all duration-200 ease-in-out
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                disabled:opacity-50 disabled:cursor-not-allowed">
                    
                {loading ? (<div className='justify-center items-center'>
                  <span className='text-xl font-bold'>Processing....</span>
                </div>) : 'SIGN IN'}
            </button>
            <button 
                type='button'
                className='w-full block rounded-2xl py-3 px-3 text-gray-700 bg-gray-300 hover:bg-gray-400 text-lg font-bold border border-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:ring-offset-2'
                onClick={(e)=> handAuthAction(e as unknown as React.FormEvent<HTMLFormElement>, 'SIGN_UP')}>
                  Create New Account
            </button>
          </div>
      
        </form>
      </div>
    </div>
  );

}