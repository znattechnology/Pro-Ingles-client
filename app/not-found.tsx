import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-customgreys-primarybg px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-purple-600">
          404
        </h1>

        {/* Title */}
        <h2 className="mt-4 text-2xl font-bold text-white">
          Página não encontrada
        </h2>

        {/* Description */}
        <p className="mt-4 text-gray-400">
          A página que procura não existe ou foi movida para outro endereço.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            Voltar ao Início
          </Link>
          <Link
            href="/user/courses/explore"
            className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg border border-gray-700 transition-all duration-200"
          >
            Explorar Cursos
          </Link>
        </div>

        {/* Decorative elements */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}
