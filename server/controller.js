const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process'); // Use destructuring
const util = require('util');
const execPromise = util.promisify(exec); // Promisify exec

async function runCode(code) {
    console.log('Executing Playwright script...');
    const tempDir = path.join(__dirname, 'tests');
    const tempFilePath = path.join(tempDir, 'tempscript.spec.js');

    try {
        // Write the code to a temporary file
        await fs.writeFile(tempFilePath, code);
        console.log(`Temporary script written to ${tempFilePath}`);

        // Define the command and options
        const command = `npx playwright test tests/tempscript.spec.js --headed --project chromium`;
        const options = { cwd: __dirname }; // Run from the server directory

        console.log(`Executing command: ${command} in ${options.cwd}`);

        // Run the script using promisified exec
        const { stdout, stderr } = await execPromise(command, options);

        console.log('Playwright stdout:', stdout);
        if (stderr) {
            console.error('Playwright stderr:', stderr);
            // Decide if stderr always means failure for Playwright tests
            // Sometimes warnings or info might go to stderr
        }

        // Check stdout for Playwright success indicators if needed
        // For now, assume no error thrown means success
        return {
            output: stdout || 'Script executed successfully (No stdout)',
            success: true
        };

    } catch (error) {
        console.error('Error running code:', error);
        // error object from execPromise contains stdout and stderr
        const output = `Execution failed:\n${error.stderr || error.stdout || error.message}`;
        return {
            output: output,
            success: false
        };
    } finally {
        // Clean up temporary files (optional, maybe keep for debugging)
        try {
            console.log('Script execution finished.');
            // Optional: Uncomment to delete the temp file after execution
            // await fs.unlink(tempFilePath);
            // console.log(`Deleted temporary file: ${tempFilePath}`);
        } catch (cleanupError) {
            console.error('Error cleaning up temporary file:', cleanupError);
        }
    }
    // Removed the commented-out browser launch code
    // const result = await page.evaluate(async () => {
    //   try {
    //     const module = await import(`./temp_script.js?${Date.now()}`); // This approach is complex and likely not needed with exec
    //     return 'Script executed successfully';
    //   } catch (error) {
    //     return `Error: ${error.message}`;
    //   }
    // });

    //await browser.close();

    
//   } catch (error) {
//     console.error('Error running code:', error);
//     //await browser.close();
//     return {
//       output: `Execution failed: ${error.message}`,
//       success: false
//     };
//   } finally {
//     // Clean up temporary files
//     try {
//         console.log('done')
//       //await fs.unlink(path.join(tempDir, 'tempscript.spec.js'));
//     } catch {}
//   }
 }

module.exports = { runCode }
