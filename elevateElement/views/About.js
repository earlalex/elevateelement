import { renderView } from '../utils/index.js';

export const About = {
    path: '/about',
    title: 'About',
    content: `
    <div class="about-container">
        <h1>About ElevateElement</h1>
        
        <section class="mission-section">
            <h2>Our Mission</h2>
            <p>ElevateElement is built with the mission to provide developers with a lightweight, native-first framework that brings control back to your hands.</p>
            <p>We believe in web standards, minimal abstractions, and the power of native browser capabilities.</p>
        </section>
        
        <section class="philosophy-section">
            <h2>Core Philosophy</h2>
            <blockquote>"Closer to the metal, infinitely flexible, and fully yours."</blockquote>
            <p>ElevateElement emphasizes ownership, customizability, and performance, keeping your web stack aligned with native browser capabilities. No compile step, no virtual DOM - just pure web components with enhancement layers you control.</p>
        </section>
        
        <section class="tech-section">
            <h2>Technology</h2>
            <p>Built on Web Components, ElevateElement embraces and extends the native capabilities of modern browsers:</p>
            <ul>
                <li>Custom Elements</li>
                <li>Shadow DOM</li>
                <li>HTML Templates</li>
                <li>CSS Containment</li>
            </ul>
            <p>We add thoughtful abstractions only where they meaningfully improve the developer experience.</p>
        </section>
    </div>
    
    <style>
        .about-container {
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #6200ea;
            margin-bottom: 30px;
        }
        h2 {
            color: #444;
            margin-top: 40px;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 10px;
        }
        blockquote {
            font-style: italic;
            border-left: 4px solid #6200ea;
            padding-left: 20px;
            margin-left: 0;
            color: #555;
        }
        ul {
            list-style-type: disc;
            padding-left: 20px;
        }
        li {
            margin-bottom: 10px;
        }
        .mission-section, .philosophy-section, .tech-section {
            margin-bottom: 40px;
        }
    </style>
    `,
    load: async (params = {}) => {
      try {
        // Use the standardized renderView utility
        return await renderView(About, 'About');
      } catch (error) {
        console.error('[About View] Error loading about view:', error);
        return false;
      }
    }
};