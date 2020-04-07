#!/usr/bin/env node

const fs = require('fs');
const chalk = require('chalk');
const CFonts = require('cfonts');
const Table = require('cli-table');
const program = require('commander');
const inquirer = require('inquirer');
const download = require('download-git-repo');

const table = new Table({
  chars: {
    top: '═',
    'top-mid': '╤',
    'top-left': '╔',
    'top-right': '╗',
    bottom: '═',
    'bottom-mid': '╧',
    'bottom-left': '╚',
    'bottom-right': '╝',
    left: '║',
    'left-mid': '╟',
    mid: '─',
    'mid-mid': '┼',
    right: '║',
    'right-mid': '╢',
    middle: '│'
  }
});
const packageInfo = require('../package.json');
program.version(packageInfo.version, '-v, --version', 'Output The Current Version');
program
  .command('info')
  .description('Output Project Information')
  .action(() => {
    CFonts.say('GENTPL-CLI', {font: 'shade', align: 'center', colors: ['#f80', '#840']});
    const packageInfo = require('../package.json');
    console.log('Verison:', chalk.cyanBright(packageInfo.version));
    console.log(
      'Description:',
      chalk.cyanBright(
        'The Project Can Provide All Kinds Of Front-end Templates For You, Just Have A Nice Try!'
      )
    );
    process.exit(0);
  });
const templates = require('../config/templates.json');
program
  .command('list')
  .description('List All Templates')
  .action(() => {
    table.push(['templateIndex', 'templateName', 'description']);
    templates.forEach((template, index) => {
      const listItem = [index + 1, template.name, template.description];
      table.push(listItem);
    });
    console.log(table.toString());
    process.exit(0);
  });
program
  .command('add')
  .description('Add Local Template To CLI')
  .action(() => {
    let templatePlatforms = ['GitHub'];
    inquirer
      .prompt([
        {type: 'input', name: 'name', message: 'Template Name: '},
        {type: 'input', name: 'author', message: 'Template Author: '},
        {
          type: 'input',
          name: 'description',
          message: 'Description: ',
          default: 'A Template Project'
        },
        {type: 'list', name: 'platform', message: 'Template From: ', choices: templatePlatforms}
      ])
      .then((answers) => {
        if (!answers.name.trim() || !answers.author.trim()) {
          console.log(chalk.red('Add Local Template To CLI Failed: '));
          process.exit(0);
        }
        const template = {
          name: answers.name,
          description: answers.description,
          url: `https://github.com/${answers.author}/${answers.name}`,
          downloadUrl: `https://github.com:${answers.author}/${answers.name}#master`
        };
        templates.push(template);
        fs.writeFile('config/templates.json', JSON.stringify(templates, null, 4), (err) => {
          if (err) {
            console.log('Add Local Template To CLI Failed: ', err);
            process.exit(0);
          }
          console.log(chalk.cyanBright('Add Local Template To CLI Successful'));
        });
      })
      .catch((err) => {
        console.log(chalk.red('Add Local Template To CLI Failed: ', err));
        process.exit(0);
      });
  });
program
  .command('init')
  .description('Initialize Project Through Template')
  .action(() => {
    let projectName = 'original-project';
    let templateName = '';
    let templateNames = [];
    templates.forEach((template) => {
      templateNames.push(template.name);
    });
    inquirer
      .prompt([
        {type: 'input', name: 'name', message: 'Project Name: ', default: projectName},
        {type: 'list', name: 'template', message: 'Project Template: ', choices: templateNames},
        {
          type: 'input',
          name: 'description',
          message: 'Project Description: ',
          default: 'A Template Project'
        },
        {
          type: 'input',
          name: 'author',
          message: 'Project Author: ',
          default: 'Jayson Wu <wulingjie991@outlook.com>'
        }
      ])
      .then((answers) => {
        const progressBar = '==';
        const progressArrow = '>>';
        const progressContent = [];
        templateName = answers.template;
        delete answers.template;
        const timer = setInterval(() => {
          printProgress(['[', ...progressContent, progressArrow, ']'].join(''));
          progressContent.push(progressBar);
        }, 500);
        const printProgress = (progress) => {
          const terminalWidth = process.stdout.columns - 10;
          const contentLength = progress.contentLength;
          process.stdout.clearLine();
          process.stdout.cursorTo(0);
          process.stdout.write(chalk.greenBright(progress));
          if (contentLength >= terminalWidth) clearInterval(timer);
        };
        const {downloadUrl} = templates.find((template) => templateName === template.name);
        download(downloadUrl, projectName, {clone: true}, (err) => {
          clearInterval(timer);
          if (err) {
            console.log(chalk.red('Template Downloading Failed: ', err));
            process.exit(0);
          }
          const packagePath = `${projectName}/package.json`;
          const packageContent = fs.readFileSync(packagePath, 'utf8');
          fs.writeFileSync(
            packagePath,
            JSON.stringify({...JSON.parse(packageContent), ...answers}, null, 4),
            (err) => {
              if (err) {
                console.log(chalk.red('Rewrite Package.json Failed: ', err));
                process.exit(0);
              }
              console.log('');
              console.log(chalk.cyanBright('Rewrite Package.json Successful'));
            }
          );
          console.log('');
          console.log(chalk.cyanBright('Initialize Your Project Successful'));
        });
      })
      .catch((err) => {
        console.log(chalk.red('Initialize Your Project Failed: ', err));
        process.exit(0);
      });
  });
program.parse(process.argv);
