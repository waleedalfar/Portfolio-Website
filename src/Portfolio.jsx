
import React from "react";

export default function Portfolio() {
  return (
    <main className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <section className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Waleed Alfar</h1>
        <p className="text-lg text-muted-foreground">
          Computer Science Major • Software Developer
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
            <h3 className="text-xl font-medium">Archyx AI</h3>
            <p className="text-sm text-muted-foreground">
              Full-stack AI document management system that uses Python (FastAPI, LangChain, Celery) and Google Apps
Script to automate classification and organization of Google Drive documents.
            </p>
          </div>
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-medium">First Response AI</h3>
            <p className="text-sm text-muted-foreground">
              AI medical chatbot that uses LLMs via LangChain, enabling users to query healthcare
information in natural language with context-aware responses.
            </p>
          </div>
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-medium">Spring Boot API Service</h3>
            <p className="text-sm text-muted-foreground">
              REST API that uses Spring Boot and Java, leveraging dependency management with Maven
for efficient build and version control
            </p>
          </div>
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-medium">Sweet Home Bakery</h3>
            <p className="text-sm text-muted-foreground">
              Responsive website using HTML, CSS, and JavaScript to improve user expierence and accessibility.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">About Me</h2>
        <p className="text-muted-foreground">
          I'm a Computer Science major and Undergraduate Teaching Assistant at Arizona State University with a passion
          for software development, especially in data-driven applications and
          user-centered design. I enjoy building solutions that solve real-world
          problems and am currently seeking opportunities in software engineering.
          
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Skills</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 list-disc list-inside text-muted-foreground">
          <li>Javascript</li>
          <li>Python</li>
          <li>C++</li>
          <li>Java</li>
          <li>React</li>
          <li>SQL</li>
          <li>Spring Boot</li>
          <li>LangChain</li>
          <li>FastAPI</li>
          <li>Flask</li>
          <li>Maven</li>
          <li>Tailwind CSS</li>
        </ul>
      </section>
    </main>
  );
}
