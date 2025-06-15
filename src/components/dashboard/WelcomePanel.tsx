
import { Link } from "react-router-dom";

export function WelcomePanel() {
  return (
    <section className="bg-gradient-to-tr from-primary to-cyan-700/80 text-white shadow-lg rounded-xl p-8 w-full max-w-sm flex flex-col items-center justify-center animate-fade-in min-w-0">
      <h3 className="text-xl font-bold mb-4">¡Bienvenido al Box!</h3>
      <p className="text-white/90 text-base mb-6 text-center">
        Empieza a registrar tus avances.<br />Accede al catálogo de ejercicios y personaliza tus entrenamientos.
      </p>
      <Link
        to="/workouts"
        className="bg-white text-primary px-6 py-2 rounded-full font-bold shadow hover:scale-105 hover:bg-blue-100 transition-all"
      >
        Crear entrenamiento
      </Link>
    </section>
  );
}
