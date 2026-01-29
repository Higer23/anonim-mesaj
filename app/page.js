"use client"; // Etkileşim için bu şart

import { useState } from 'react';

import { createClient } from '@supabase/supabase-js';



// Buradaki bilgileri Supabase Settings > API kısmından alacaksın

const supabase = createClient('https://twsjsqzvojofefknyavi.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3c2pzcXp2b2pvZmVma255YXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3MDMyOTIsImV4cCI6MjA4NTI3OTI5Mn0.-GHoapQTzRbUOhAZ5i3q8X2cblVoCE1GDx09veolmB8');



export default function Home() {

  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);



  const sendAnonMessage = async () => {

    if (!message) return alert("Boş mesaj gönderilemez!");

    setLoading(true);

    

    const { error } = await supabase

      .from('messages')

      .insert([{ content: message }]);



    if (error) {

      alert("Hata oluştu!");

    } else {

      alert("Mesajın başarıyla (anonim olarak) iletildi! 🎉");

      setMessage('');

    }

    setLoading(false);

  };



  return (

    <main className="min-h-screen bg-[#6366f1] flex items-center justify-center p-6 font-sans">

      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 text-center">

        <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto -mt-20 border-8 border-[#6366f1] overflow-hidden">

          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky" alt="avatar" />

        </div>



        <h1 className="text-xl font-bold mt-4 text-gray-800">@kullaniciadi</h1>

        

        <textarea 

          value={message}

          onChange={(e) => setMessage(e.target.value)}

          placeholder="Mesajını buraya yaz..."

          className="w-full h-40 bg-gray-50 border-2 border-gray-100 rounded-3xl p-5 mt-6 text-gray-700 outline-none transition-all resize-none"

        />



        <button 

          onClick={sendAnonMessage}

          disabled={loading}

          className="w-full bg-[#ec4899] hover:bg-[#db2777] text-white font-extrabold py-4 rounded-2xl mt-6 shadow-lg active:scale-95 transition-all text-lg disabled:opacity-50"

        >

          {loading ? "GÖNDERİLİYOR..." : "ANONİM GÖNDER 🚀"}

        </button>

      </div>

    </main>

  );

}