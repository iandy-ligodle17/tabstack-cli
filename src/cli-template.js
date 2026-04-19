#!/usr/bin/env node
const { saveTemplate, loadTemplate, listTemplates, applyTemplate, deleteTemplate } = require('./commands/template');

const [,, sub, ...args] = process.argv;

async function main() {
  switch (sub) {
    case 'save': {
      const [sessionName, templateName] = args;
      if (!sessionName || !templateName) {
        console.error('Usage: tabstack template save <session> <template-name>');
        process.exit(1);
      }
      const t = await saveTemplate(sessionName, templateName);
      console.log(`Template '${t.name}' saved with ${t.tabs.length} tab(s).`);
      break;
    }
    case 'apply': {
      const [templateName, newSession] = args;
      if (!templateName || !newSession) {
        console.error('Usage: tabstack template apply <template-name> <session>');
        process.exit(1);
      }
      const s = await applyTemplate(templateName, newSession);
      console.log(`Session '${s.name}' created from template '${templateName}' with ${s.tabs.length} tab(s).`);
      break;
    }
    case 'list': {
      const templates = await listTemplates();
      if (templates.length === 0) {
        console.log('No templates saved.');
      } else {
        console.log('Templates:');
        templates.forEach(t => console.log(`  - ${t}`));
      }
      break;
    }
    case 'delete': {
      const [templateName] = args;
      if (!templateName) {
        console.error('Usage: tabstack template delete <template-name>');
        process.exit(1);
      }
      await deleteTemplate(templateName);
      console.log(`Template '${templateName}' deleted.`);
      break;
    }
    default:
      console.error('Unknown subcommand. Use: save, apply, list, delete');
      process.exit(1);
  }
}

main().catch(err => { console.error(err.message); process.exit(1); });
