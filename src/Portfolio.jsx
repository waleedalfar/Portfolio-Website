
import React from "react";

export default function Portfolio() {
  return (
    <main className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Waleed Alfar</h1>
        <p className="text-lg text-muted-foreground">
          Computer Science Major • Software Developer • Problem Solver
        </p>
        <div className="flex justify-center gap-4 pt-2">
          <a href="mailto:contact@waleedalfar.com">📧</a>
          <a href="https://github.com/waleedalfar" target="_blank">🔗</a>
          <a href="/WaleedAlfar_Resume.pdf" target="_blank">📄</a>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Projects</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-medium">Workout Tracker App</h3>
            <p className="text-sm text-muted-foreground">
              A C++/Qt app for tracking exercises, sets, and progress.
            </p>
          </div>
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-medium">Portfolio Website</h3>
            <p className="text-sm text-muted-foreground">
              A personal website built using React and Tailwind CSS.
            </p>
          </div>
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-medium">Login System</h3>
            <p className="text-sm text-muted-foreground">
              Java Spring Boot backend with file upload/download features.
            </p>
          </div>
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-medium">Guessing Game (Scheme)</h3>
            <p className="text-sm text-muted-foreground">
              Interactive command-line game built using Scheme.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">About Me</h2>
        <p className="text-muted-foreground">
          I'm a Computer Science major at Arizona State University with a passion
          for software development, especially in data-driven applications and
          user-centered design. I enjoy building solutions that solve real-world
          problems and am currently seeking opportunities in software engineering
          or data analytics.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Skills</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 list-disc list-inside text-muted-foreground">
          <li>C++</li>
          <li>Java</li>
          <li>React</li>
          <li>Python</li>
          <li>SQL</li>
          <li>Spring Boot</li>
          <li>Git & GitHub</li>
          <li>Tailwind CSS</li>
          <li>Qt</li>
        </ul>
      </section>
    </main>
  );
}
