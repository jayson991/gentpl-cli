#!/usr/bin/env node

const fs = require('fs')
const CFonts = require('cfonts')
const program = require('commander')
const inquirer = require('inquirer')
const download = require('download-git-repo')

const packageInfo = require('../package.json')
program.version(packageInfo.version, '-v, --version', 'Output The Current Version')
program
  .command('info')
  .description('Output Project Information')
  .action(() => {
    CFonts.say('GENTPL-CLI', { font: 'shade', align: 'left', colors: ['#f80', '#840'] })
    console.log('Verison:', packageInfo.version)
    console.log(
      'Description:',
      'The Project Can Provide All Kinds Of Front-end Templates For You, Just Have A Nice Try!'
    )
    process.exit(0)
  })
const templates = require('./templates.json')
program
  .command('list')
  .description('List All Templates')
  .action(() => {
    let allTemplates = []
    templates.forEach((template) => {
      let templateItem = {
        templateName: template.name,
        description: template.description
      }
      allTemplates.push(templateItem)
    })
    console.table(allTemplates)
    process.exit(0)
  })
program
  .command('add')
  .description('Add Local Template To CLI')
  .action(() => {
    let templatePlatforms = ['GitHub']
    let branchNames = ['main', 'master']
    inquirer
      .prompt([
        { type: 'input', name: 'name', message: 'Template Name: ' },
        { type: 'input', name: 'author', message: 'GitHub UserName: ', default: 'jayson991' },
        {
          type: 'input',
          name: 'description',
          message: 'Description: ',
          default: 'A Template Project'
        },
        { type: 'list', name: 'platform', message: 'Template From: ', choices: templatePlatforms },
        { type: 'list', name: 'branch', message: 'From Branch: ', choices: branchNames }
      ])
      .then((answers) => {
        if (!answers.name.trim() || !answers.author.trim()) {
          console.log('Add Local Template To CLI Failed: ')
          process.exit(0)
        }
        const template = {
          name: answers.name,
          description: answers.description,
          url: `https://github.com/${answers.author}/${answers.name}`,
          downloadUrl: `https://github.com:${answers.author}/${answers.name}#${answers.branch}`
        }
        templates.push(template)
        fs.writeFile('templates.json', JSON.stringify(templates, null, 2), (err) => {
          if (err) {
            console.log('Add Local Template To CLI Failed: ', err)
            process.exit(0)
          }
          console.log('Add Local Template To CLI Successful')
        })
      })
      .catch((err) => {
        console.log('Add Local Template To CLI Failed: ', err)
        process.exit(0)
      })
  })
program
  .command('init')
  .description('Initialize Project Through Template')
  .action(() => {
    let projectName = 'original-project'
    let templateName = ''
    let templateNames = []
    templates.forEach((template) => {
      templateNames.push(template.name)
    })
    inquirer
      .prompt([
        { type: 'input', name: 'name', message: 'Project Name: ', default: projectName },
        { type: 'list', name: 'template', message: 'Project Template: ', choices: templateNames },
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
        const progressBar = '=='
        const progressArrow = '>>'
        const progressContent = []
        templateName = answers.template
        delete answers.template
        const timer = setInterval(() => {
          console.log(['[', ...progressContent, progressArrow, ']'].join(''))
          progressContent.push(progressBar)
        }, 500)
        const { downloadUrl } = templates.find((template) => templateName === template.name)
        download(downloadUrl, answers.name || projectName, { clone: true }, (err) => {
          clearInterval(timer)
          if (err) {
            console.log('Template Downloading Failed: ', err)
            process.exit(0)
          }
          const packagePath = `${answers.name || projectName}/package.json`
          const packageContent = fs.readFileSync(packagePath, 'utf8')
          fs.writeFileSync(
            packagePath,
            JSON.stringify({ ...JSON.parse(packageContent), ...answers }, null, 2),
            (err) => {
              if (err) {
                console.log('Rewrite Package.json Failed: ', err)
                process.exit(0)
              }
              console.log('\n', 'Rewrite Package.json Successful')
            }
          )
          console.log('\n', 'Initialize Your Project Successful')
        })
      })
      .catch((err) => {
        console.log('Initialize Your Project Failed: ', err)
        process.exit(0)
      })
  })
program.parse(process.argv)
