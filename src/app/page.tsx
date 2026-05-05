import Link from 'next/link';
import { Film, Ticket, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950">
      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            🎬 Nonton Film Favorit
            <span className="text-red-500"> Lebih Mudah</span>
          </h1>
          <p className="text-gray-400 text-xl mb-10">
            Pesan tiket bioskop online, pilih kursi, bayar, dan tiket langsung di tangan kamu.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/movies"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors"
            >
              Lihat Film
            </Link>
            <Link
              href="/auth/register"
              className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg transition-colors"
            >
              Daftar Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <Film className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Film Terbaru</h3>
            <p className="text-gray-400 text-sm">
              Temukan film terbaru dengan jadwal tayang yang lengkap di bioskop favoritmu.
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <Ticket className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Pilih Kursi</h3>
            <p className="text-gray-400 text-sm">
              Pilih kursi favoritmu langsung dari peta kursi interaktif secara real-time.
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 text-center">
            <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold text-lg mb-2">Pembayaran Aman</h3>
            <p className="text-gray-400 text-sm">
              Bayar dengan berbagai metode pembayaran yang aman dan terpercaya.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}