export const dynamic = 'force-static'

export default function ComoFunciona() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Volver a los picks
        </a>

        <h1 className="text-3xl font-semibold mt-6 mb-2">Cómo funciona el modelo</h1>
        <p className="text-gray-400 text-sm mb-10">
          Un resumen honesto de qué calcula, con qué datos, y qué no sabe.
        </p>

        <section className="mb-10">
          <h2 className="text-lg font-medium mb-3 text-emerald-400">La base: rating Elo</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-3">
            Cada equipo tiene un puntaje que sube cuando gana y baja cuando pierde. Cuánto sube o baja
            depende de qué tan fuerte era el rival — ganarle a un equipo fuerte suma más que ganarle a
            uno débil. Es el mismo sistema que se usa para clasificar jugadores de ajedrez, adaptado a
            resultados de partidos.
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Los ratings se calculan desde cero con los resultados reales de la temporada — no se
            inventan ni se ajustan a mano.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium mb-3 text-emerald-400">Los ajustes que se suman</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-200 mb-1">Ventaja de local</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Jugar en casa suma puntos extra al rating, porque estadísticamente sí influye.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200 mb-1">Días de descanso</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Un equipo que llega con más días de descanso que su rival recibe un pequeño ajuste a favor.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-200 mb-1">Forma reciente</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Se revisan los últimos 5 partidos de cada equipo. Una racha de victorias suma puntos;
                una racha de derrotas resta.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-medium mb-3 text-gray-300">Lo que el modelo no sabe</h2>
          <ul className="text-gray-400 text-sm leading-relaxed space-y-2 list-disc list-inside">
            <li>No conoce lesiones o suspensiones de jugadores específicos con precisión total</li>
            <li>No mide presión, motivación, ni el peso de una final</li>
            <li>No considera clima, cancha, ni condiciones del día del partido</li>
          </ul>
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <p className="text-sm text-gray-300 leading-relaxed">
            Este es un modelo estadístico, no una promesa. Las probabilidades reflejan una estimación
            razonable basada en datos históricos, no una certeza. Apostar conlleva riesgo — juega con
            responsabilidad.
          </p>
        </section>
      </div>
    </main>
  )
}
