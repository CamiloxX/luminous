import Link from "next/link";

interface Props {
  searchParams: Promise<{ error?: string; email?: string }>;
}

export default async function VerifyPage({ searchParams }: Props) {
  const { error, email } = await searchParams;

  if (error) {
    return (
      <div className="min-h-screen bg-[#f8f5ff] dark:bg-[#07091e] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-[#fb5151]/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[#b31b25] text-4xl">error</span>
          </div>
          <h1
            className="text-2xl font-extrabold text-[#272b51] dark:text-[#c8ccf0] mb-2"
            style={{ fontFamily: "var(--font-plus-jakarta)" }}
          >
            Link inválido
          </h1>
          <p className="text-[#545881] dark:text-[#969ac6] mb-8">
            El link de verificación expiró o ya fue usado. Intenta registrarte de nuevo.
          </p>
          <Link
            href="/register"
            className="bg-gradient-to-br from-[#0052d0] to-[#799dff] text-white font-bold py-3 px-8 rounded-full shadow-[0_8px_24px_rgba(0,82,208,0.2)]"
          >
            Volver al registro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ff] dark:bg-[#07091e] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Animated envelope */}
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#0052d0] to-[#799dff] flex items-center justify-center mx-auto mb-6 shadow-[0_12px_32px_rgba(0,82,208,0.3)]">
          <span
            className="material-symbols-outlined text-white text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_unread
          </span>
        </div>

        <Link
          href="/"
          className="text-3xl font-black text-[#0052d0] tracking-tighter italic block mb-6"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          Luminous
        </Link>

        <h1
          className="text-2xl font-extrabold text-[#272b51] dark:text-[#c8ccf0] mb-3"
          style={{ fontFamily: "var(--font-plus-jakarta)" }}
        >
          Revisa tu correo
        </h1>

        <p className="text-[#545881] dark:text-[#969ac6] leading-relaxed mb-2">
          Te enviamos un link de verificación a
        </p>
        {email && (
          <p className="font-bold text-[#272b51] dark:text-[#c8ccf0] text-lg mb-6">
            {decodeURIComponent(email)}
          </p>
        )}

        <div className="bg-white dark:bg-[#111328] rounded-[1.5rem] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] text-left space-y-3 mb-8">
          {[
            { icon: "inbox", text: "Abre tu bandeja de entrada" },
            { icon: "mail", text: 'Busca un correo de "Luminous"' },
            { icon: "open_in_new", text: "Haz clic en el botón de confirmación" },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#f1efff] dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#0052d0] dark:text-[#5e8bff] text-lg">
                  {step.icon}
                </span>
              </div>
              <p className="text-sm text-[#272b51] dark:text-[#c8ccf0]">{step.text}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-[#545881] dark:text-[#969ac6]">
          ¿No te llegó?{" "}
          <Link href="/register" className="text-[#0052d0] dark:text-[#5e8bff] font-bold hover:opacity-80 transition-opacity">
            Intentar de nuevo
          </Link>
        </p>
      </div>
    </div>
  );
}
