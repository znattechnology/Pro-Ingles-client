"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0 }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a2e",
            padding: "1rem",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            {/* Error Icon */}
            <div
              style={{
                margin: "0 auto",
                width: "96px",
                height: "96px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "24px",
              }}
            >
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: "1.875rem",
                fontWeight: "bold",
                color: "white",
                margin: "0 0 16px 0",
              }}
            >
              Erro Crítico
            </h1>

            {/* Description */}
            <p
              style={{
                color: "#9ca3af",
                margin: "0 0 32px 0",
                lineHeight: "1.5",
              }}
            >
              Ocorreu um erro grave na aplicação. Por favor, recarregue a página ou tente mais tarde.
            </p>

            {/* Actions */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                onClick={() => reset()}
                style={{
                  padding: "12px 24px",
                  background: "linear-gradient(to right, #7c3aed, #9333ea)",
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Tentar Novamente
              </button>
              <a
                href="/"
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#374151",
                  color: "white",
                  fontWeight: "600",
                  borderRadius: "8px",
                  border: "1px solid #4b5563",
                  textDecoration: "none",
                  textAlign: "center",
                  fontSize: "1rem",
                }}
              >
                Voltar ao Início
              </a>
            </div>

            {/* Error ID */}
            {error.digest && (
              <p
                style={{
                  marginTop: "24px",
                  fontSize: "0.75rem",
                  color: "#6b7280",
                }}
              >
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
