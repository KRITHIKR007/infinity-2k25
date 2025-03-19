/**
 * Setup script for Infinity 2025 website
 * Run with: node setup.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\n=== Infinity 2025 Website Setup ===\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

// Create .env file if it doesn't exist
if (!envExists) {
    console.log('Creating .env file...');
    promptForEnvVariables();
} else {
    console.log('.env file already exists. Do you want to reconfigure it?');
    rl.question('Reconfigure (y/n)? ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            promptForEnvVariables();
        } else {
            installDependencies();
        }
    });
}

// Prompt user for environment variables
function promptForEnvVariables() {
    console.log('\nPlease enter your Supabase credentials:');
    
    rl.question('Supabase URL: ', (supabaseUrl) => {
        rl.question('Supabase API Key: ', (supabaseKey) => {
            console.log('\nOptional: Configure event dates');
            
            rl.question('Event Date (format: Month DD, YYYY HH:MM:SS, default: Mar 27, 2025 09:00:00): ', (eventDate) => {
                rl.question('Registration Deadline (format: Month DD, YYYY HH:MM:SS, default: Mar 26, 2025 23:59:59): ', (regDeadline) => {
                    // Create .env content
                    const envContent = `SUPABASE_URL=${supabaseUrl || ''}
SUPABASE_KEY=${supabaseKey || ''}
EVENT_DATE=${eventDate || 'Mar 27, 2025 09:00:00'}
REGISTRATION_DEADLINE=${regDeadline || 'Mar 26, 2025 23:59:59'}
NODE_ENV=development
`;

                    // Write to .env file
                    fs.writeFileSync(envPath, envContent);
                    console.log('\n.env file created successfully!');
                    
                    // Continue with installation
                    installDependencies();
                });
            });
        });
    });
}

// Install dependencies
function installDependencies() {
    console.log('\nInstalling dependencies...');
    
    // Check if package.json exists
    const packageJsonPath = path.join(__dirname, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        console.error('Error: package.json not found. Make sure you are in the project root directory.');
        rl.close();
        return;
    }
    
    // Run npm install
    exec('npm install', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error installing dependencies: ${error.message}`);
            rl.close();
            return;
        }
        
        console.log(stdout);
        console.log('\nDependencies installed successfully!');
        
        // Ask if user wants to set up Supabase database
        rl.question('\nDo you want to set up the Supabase database schema? (y/n) ', (answer) => {
            if (answer.toLowerCase() === 'y') {
                setupDatabase();
            } else {
                finishSetup();
            }
        });
    });
}

// Setup database (optional)
function setupDatabase() {
    console.log('\nSetting up database...');
    console.log('NOTE: This requires having the Supabase CLI installed.');
    
    rl.question('Do you have the Supabase CLI installed? (y/n) ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            // Execute database setup script
            exec('node scripts/db-setup.js', (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error setting up database: ${error.message}`);
                    console.log('Please set up the database manually using the SQL scripts in the /db folder.');
                    finishSetup();
                    return;
                }
                
                console.log(stdout);
                console.log('\nDatabase setup completed successfully!');
                finishSetup();
            });
        } else {
            console.log('\nPlease install the Supabase CLI or set up the database manually using the SQL scripts in the /db folder.');
            finishSetup();
        }
    });
}

// Finish setup
function finishSetup() {
    console.log('\n=== Setup Complete ===');
    console.log('To start the development server, run:');
    console.log('  npm run dev');
    console.log('\nTo build for production, run:');
    console.log('  npm run build');
    console.log('\nThank you for using Infinity 2025!');
    
    rl.close();
}
