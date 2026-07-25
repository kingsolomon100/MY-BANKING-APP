'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Profile {
  email: string;
  balance: number;
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [isTransferring, setIsTransferring] = useState(false);
  const [txMessage, setTxMessage] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");

  const router = useRouter();


  const handleAuthFetch = useCallback(async () => {
    setLoading(true);
    setDbError(null);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth Error:', authError);
      router.push("/");
      return;
    }

    
    const { data, error: db_error } = await supabase
      .from("profiles")
      .select("email, balance")
      .eq("id", user.id)
      .single();

    if (db_error) {
      console.error('Database fetch error:', db_error);
      setDbError(`Database Connection Error: ${db_error.message}`);
    } else if (data) {
      setProfile({
        email: data.email || user.email || "",
        balance: data.balance ?? 1000.00,
      });
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    handleAuthFetch();
  }, [handleAuthFetch]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientEmail || !amount) {
      setTxMessage('Please fill in both the recipient email and amount.');
      return;
    }

    const transferAmount = Number(parseFloat(amount).toFixed(2));
    if (isNaN(transferAmount) || transferAmount <= 0) {
      setTxMessage('Please enter a valid transfer amount.');
      return;
    }

    setIsTransferring(true);
    setTxMessage('Processing transaction...');

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setTxMessage('Transaction Failed: Session expired. Please sign out and sign in again.');
        setIsTransferring(false);
        return;
      }

      const activeSenderEmail = profile?.email || session.user.email || "";

      if (!activeSenderEmail) {
        setTxMessage('Transaction Failed: Could not verify active sender email.');
        setIsTransferring(false);
        return;
      }

      // Execute RPC using the centralized supabase client instance
      const response = await supabase.rpc("transfer_money", {
        sender_email: activeSenderEmail.trim(),
        recipient_email: recipientEmail.trim(),
        transfer_amount: transferAmount,
      });

      console.log('--- RPC RESPONSE DEBUG ---');
      console.log('Data:', response.data);
      console.log('Error:', response.error);

      if (response.error) {
        setTxMessage(`RPC Error (${response.error.code}): ${response.error.message}`);
      } else if (typeof response.data === 'string' && response.data.startsWith('Error:')) {
        setTxMessage(`SQL Logic Error: ${response.data.replace('Error: ', '')}`);
      } else {
        setTxMessage('✅ Success! Transaction completed.');
        setAmount("");
        setRecipientEmail("");
        await handleAuthFetch();
      }
    } catch (err: any) {
      console.error('Caught Transfer Exception:', err);
      const caughtMsg = err?.message || err?.error_description || JSON.stringify(err);
      setTxMessage(`Transaction Failed: ${caughtMsg}`);
    } finally {
      setIsTransferring(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-4xl font-black text-gray-800 animate-pulse" role="status">
          Loading account dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-100">
      <nav className="bg-gray-900 rounded-xl shadow-lg w-full max-w-4xl mx-auto p-4 mb-8">
        <div className="flex items-center justify-between">
          <span className="text-xl md:text-2xl text-emerald-500 font-bold tracking-wider uppercase">
            ✈ First Bank PLC
          </span>

          <div className="flex items-center gap-4">
            <span className="font-semibold text-sm text-gray-200 hidden sm:inline">
              {profile?.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 transition-colors py-2 px-4 text-white text-sm font-bold rounded-lg"
            >
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto space-y-6">
        {dbError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg font-medium">
            <strong className="font-bold">Error: </strong>
            <span>{dbError}</span>
          </div>
        )}

        <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 space-y-6 shadow-md">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Welcome</h2>
            <p className="text-sm text-blue-600 font-medium">Secure Ledger Access Overview</p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-md text-white">
            <div className="text-xs uppercase text-emerald-200 tracking-wider font-bold mb-1 opacity-80">
              Primary Checking Ledger
            </div>
            <h3 className="text-4xl font-black">
              ${profile?.balance !== undefined
                ? profile.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : '0.00'}
            </h3>
          </div>

          <div className="py-3 px-4 rounded-xl border border-blue-200 bg-blue-50 flex items-center text-sm gap-3">
            <span className="text-2xl leading-none">✨</span>
            <p className="text-blue-900 font-medium">
              Your row-level security policies are active. Database connection is sandboxed.
            </p>
          </div>

          <form onSubmit={handleTransfer} className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h4 className="text-gray-800 text-md font-bold">Send Money Securely</h4>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Recipient Email
              </label>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="border border-gray-300 rounded-lg w-full py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 bg-white text-gray-800 text-sm"
                placeholder="recipient@example.com"
                disabled={isTransferring}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border border-gray-300 rounded-lg w-full py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 bg-white text-gray-800 text-sm"
                placeholder="0.00"
                disabled={isTransferring}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isTransferring}
              className="w-full bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 active:bg-emerald-800 text-white py-3 rounded-lg font-bold text-lg shadow-md transition-all ease-in-out"
            >
              {isTransferring ? 'Processing Transaction...' : 'Transfer Funds'}
            </button>
          </form>

          {txMessage && (
            <div className={`text-center text-sm font-semibold p-3 rounded-lg ${
              txMessage.includes('✅') 
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                : txMessage.includes('RPC Error') || txMessage.includes('Failed') || txMessage.includes('SQL Logic Error')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}>
              {txMessage}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}