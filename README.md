# Interactive 3D Atom Visualizer

This project is an interactive 3D visualization of atomic structures, built using web technologies. It allows users to select different chemical elements and see a visually rich and animated representation of their atomic nucleus and electron shells.

This project was created with the help of the Gemini AI assistant.

## Demo

![demo](https://github.com/user-attachments/assets/e0f933ab-99b1-4619-83a6-e6bf392d0672)



## Features

- **Dynamic Atom Creation:** Select elements from a dropdown to instantly visualize their atomic structure.
- **3D Visualization:** Built with **Three.js**, providing a fluid and interactive 3D environment.
- **Detailed Particle System:** Differentiates between protons, neutrons, and electrons.
- **Complex Orbits:** Electrons travel in unique, elliptical, and tilted orbits, representing different energy shells.
- **Polished Visuals:** A futuristic aesthetic with a custom color palette, glowing materials, and a bloom effect for extra visual appeal.
- **Smooth Transitions:** Fluid animations, powered by **TWEEN.js**, when switching between different elements.
- **Informative UI:** An on-screen panel displays key information about the selected atom (name, atomic number, particle counts).
- **Interactive Controls:** Orbit controls allow you to rotate, pan, and zoom to inspect the atom from any angle.

## Technologies Used

- **HTML5:** For the basic structure of the web page.
- **CSS3:** For styling the user interface.
- **JavaScript (ES6 Modules):** For the core application logic.
- **Three.js:** A powerful 3D graphics library for creating and rendering the scene.
- **TWEEN.js:** A library for creating smooth animations and transitions.
- **Python (for local development):** Used only to run a simple local web server. **Python is not part of the project itself.**

## Why is Python needed to run the project?

The project itself is built entirely with **HTML, CSS, and JavaScript**.

However, modern browsers have a security feature called the **Same-Origin Policy**. This policy prevents JavaScript modules (which this project uses via `import`) from being loaded directly from your local file system (`file:///...`). To get around this, the project files must be served by a local web server over the `http://` protocol.

The command `python3 -m http.server` is simply a convenient, built-in way to start such a server without needing to install any extra software. When the project is deployed to a real web hosting service, Python is no longer needed.

## How to Run

1.  **Prerequisites:** You need a modern web browser and a local web server. Python's built-in HTTP server is a simple option.

2.  **Clone the repository (or download the files):**
    ```bash
    git clone https://github.com/trashchenkov/atom_visualizer.git
    cd atom_visualizer
    ```

3.  **Start a local server:**
    If you have Python 3 installed, you can run the following command from the project's root directory:
    ```bash
    python3 -m http.server
    ```
    If you have Python 2, use:
    ```bash
    python -m SimpleHTTPServer
    ```

4.  **Open in browser:**
    Once the server is running, open your web browser and navigate to:
    [http://localhost:8000](http://localhost:8000)

You should now see the 3D atom visualizer in action.

## Project Structure

- `index.html`: The main HTML file that contains the UI panel and the canvas for the 3D scene.
- `main.js`: The core JavaScript file. It handles scene setup, atom creation, animation, and user interactions.
- `.gitignore`: Specifies files to be ignored by Git (e.g., `.env`).
- `README.md`: This documentation file.
