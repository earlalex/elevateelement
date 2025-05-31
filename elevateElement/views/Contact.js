import { renderView } from '../utils/index.js';

export const Contact = {
    path: '/contact',
    title: 'Contact',
    contentRendered: false,
    content: `
        <div class="contact-container">
          <h1>Contact Us</h1>
          
          <section class="contact-intro">
            <p>Have questions about ElevateElement? Need help implementing a feature? We're here to help!</p>
            <p>Fill out the form below or use one of our other contact channels.</p>
          </section>
          
          <div class="contact-layout">
            <section class="contact-form-section">
              <h2>Send Us a Message</h2>
              <form id="contact-form" class="contact-form">
                <div class="form-group">
                  <label for="name">Name</label>
                  <input type="text" id="name" name="name" placeholder="Your name" required>
                </div>
                
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" name="email" placeholder="Your email address" required>
                </div>
                
                <div class="form-group">
                  <label for="subject">Subject</label>
                  <select id="subject" name="subject">
                    <option value="general">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="message">Message</label>
                  <textarea id="message" name="message" rows="5" placeholder="Your message" required></textarea>
                </div>
                
                <button type="submit" class="submit-button">Send Message</button>
              </form>
            </section>
            
            <section class="contact-info-section">
              <h2>Other Ways to Connect</h2>
              <div class="contact-info">
                <div class="contact-method">
                  <h3>GitHub</h3>
                  <p>Submit issues and contribute to the project:</p>
                  <a href="https://github.com/elevateelement/framework" target="_blank" class="contact-link">github.com/elevateelement</a>
                </div>
                
                <div class="contact-method">
                  <h3>Documentation</h3>
                  <p>Check out our comprehensive documentation:</p>
                  <a href="/docs" class="contact-link">ElevateElement Docs</a>
                </div>
                
                <div class="contact-method">
                  <h3>Community</h3>
                  <p>Join our Discord community:</p>
                  <a href="https://discord.gg/elevateelement" target="_blank" class="contact-link">Discord Server</a>
                </div>
              </div>
            </section>
          </div>
        </div>
        
        <style>
          .contact-container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
          }
          
          h1 {
            color: #6200ea;
            margin-bottom: 20px;
          }
          
          .contact-intro {
            margin-bottom: 30px;
            font-size: 1.1rem;
            line-height: 1.5;
          }
          
          .contact-layout {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
          }
          
          h2 {
            color: #333;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          
          h3 {
            color: #6200ea;
            margin-bottom: 10px;
          }
          
          /* Form Styles */
          .contact-form {
            background: #f9f9f9;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          }
          
          .form-group {
            margin-bottom: 20px;
          }
          
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
          }
          
          input, select, textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-family: inherit;
            font-size: 1rem;
          }
          
          input:focus, select:focus, textarea:focus {
            border-color: #6200ea;
            outline: none;
            box-shadow: 0 0 0 3px rgba(98, 0, 234, 0.1);
          }
          
          .submit-button {
            background-color: #6200ea;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s;
          }
          
          .submit-button:hover {
            background-color: #5000ca;
          }
          
          /* Contact Info Styles */
          .contact-info-section {
            padding: 20px;
          }
          
          .contact-method {
            margin-bottom: 25px;
          }
          
          .contact-link {
            display: inline-block;
            color: #6200ea;
            text-decoration: none;
            font-weight: 500;
            margin-top: 5px;
            border-bottom: 1px solid transparent;
            transition: border-color 0.2s;
          }
          
          .contact-link:hover {
            border-color: #6200ea;
          }
          
          /* Responsive Layout */
          @media (max-width: 768px) {
            .contact-layout {
              grid-template-columns: 1fr;
            }
            
            .contact-info-section {
              order: -1;
            }
          }
        </style>
        
        <script>
          // Initialize contact form submission
          document.addEventListener('DOMContentLoaded', function() {
            const contactForm = document.getElementById('contact-form');
            if (contactForm) {
              contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // In a real app, you would submit the form data to your server
                alert('Thank you for your message! This is a demo form - in a real application, this would send your message to our team.');
                
                // Clear the form
                contactForm.reset();
              });
            }
          });
        </script>
      `,
    load: async (params = {}) => {
        try {
            // Use the standardized renderView utility
            return await renderView(Contact, 'Contact');
        } catch (error) {
            console.error('[Contact View] Error loading contact view:', error);
            return false;
        }
    }
};