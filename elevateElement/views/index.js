// Create Views registry first
// Import views individually
import { Home } from './Home.js';
import { About } from './About.js';
import { Config } from './Config.js';
import { Contact } from './Contact.js';
import { Tests } from './Tests.js';

// Initialize views array
const views = [Home, About, Config, Contact, Tests];

// Export views
export const allViews = views;

// Registration function
export function registerView(view) {
    if (!views.find(v => v.path === view.path)) {
        views.push(view);
    }
}