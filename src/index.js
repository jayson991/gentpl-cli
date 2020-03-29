#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const CFonts = require('cfonts')
const Table = require('cli-table')
const program = require('commander')
const inquirer = require('inquirer')
const download = require('download-git-repo')

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
})

program.version('0.0.5', '-v, --version', 'Output The Current Version')

program
  .command('info')
  .description('Output Project Information')
  .action(() => {
    CFonts.say('GENTPL-CLI', {
      font: 'shade',
      align: 'center',
      colors: [ '#f80', '#840' ]
    })

    const packageInfo = require('../package.json')

    console.log('Verison:', chalk.cyanBright(packageInfo.version))
    console.log(
      'Description:',
      chalk.cyanBright(
        'The Project Can Provide All Kinds Of Front-end Templates For You, Just Have A Nice Try!'
      )
    )

    process.exit(0)
  })

const templates = require('../config/templates.json')

program
  .command('list')
  .description('List All Templates')
  .action(() => {
    table.push([ 'templateIndex', 'templateName', 'description' ])
    templates.forEach((template, index) => {
      const listItem = [ index + 1, template.name, template.description ]

      table.push(listItem)
    })

    console.log(table.toString())
    process.exit(0)
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
        {
          type: 'input',
          name: 'name',
          message: 'Project Name: ',
          default: projectName
        },
        {
          type: 'list',
          name: 'template',
          message: 'Project Template: ',
          choices: templateNames
        },
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
          console.log(chalk.cyanBright([ '[', ...progressContent, progressArrow, ']' ].join('')))
          progressContent.push(progressBar)
        }, 500)

        const { downloadUrl } = templates.find((template) => templateName === template.name)
        download(downloadUrl, projectName, { clone: true }, (err) => {
          clearInterval(timer)

          if (err) {
            console.log(chalk.red('Template Downloading Failed'))
            process.exit(0)
          }

          const packagePath = `${projectName}/package.json`
          const packageContent = fs.readFileSync(packagePath, 'utf8')
          fs.writeFileSync(
            packagePath,
            JSON.stringify({ ...JSON.parse(packageContent), ...answers }, null, 4),
            (err) => {
              if (err) {
                console.log(chalk.red('Rewrite Package.json Failed'))
                process.exit(0)
              }

              console.log(chalk.cyanBright('Rewrite Package.json Successfully'))
            }
          )
          console.log(chalk.cyanBright('Initialize Your Project Successfully'))
        })
      })
      .catch((err) => {
        console.log(chalk.red('Initialize Your Project Failed: ' + err))
        process.exit(0)
      })
  })

program.parse(process.argv)
