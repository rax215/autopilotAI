const fs = require('fs').promises;
const path = require('path');
const exec = require('child_process').exec;

async function runCode(code) {
    console.log('execute playwright script');
    //console.log(code);
   const tempDir = path.join(__dirname, 'tests');
   //console.log(tempDir);
   //await fs.mkdir(tempDir, { recursive: true });
  
//   const browser = await chromium.launch();
//   const context = await browser.newContext();
//   const page = await context.newPage();

  try {
    // Write the code to a temporary file
    const tempFilePath = path.join(tempDir, 'tempscript.spec.js');
    await fs.writeFile(tempFilePath, code);

    // Run the script

    exec ("npx playwright test tempscript --headed --project chromium", (err, stdout, stderr) => {
      if(err) {
        console.log(err);
        console.log(stderr);
        return {
          output: 'Error while executing script',
          success: false
        }
      }
      else {
        console.log(stdout);
      return {
        output: 'Script executed successfully',
        success: true
      };
    }
    } );
    return {
      output: 'Executing Script...',
      success: true
    };
    // const result = await page.evaluate(async () => {
    //   try {
    //     const module = await import(`./temp_script.js?${Date.now()}`);
    //     return 'Script executed successfully';
    //   } catch (error) {
    //     return `Error: ${error.message}`;
    //   }
    // });

    //await browser.close();

    
  } catch (error) {
    console.error('Error running code:', error);
    //await browser.close();
    return {
      output: `Execution failed: ${error.message}`,
      success: false
    };
  } finally {
    // Clean up temporary files
    try {
        console.log('done')
      //await fs.unlink(path.join(tempDir, 'tempscript.spec.js'));
    } catch {}
  }
}

module.exports = { runCode };