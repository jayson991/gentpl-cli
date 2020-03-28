#!/usr/bin/env node

const fs = require('fs')
const chalk = require('chalk')
const Table = require('cli-table')
const program = require('commander')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const download = require('download-git-repo')

const templates = require('../config/templates.json')

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

const progressBar = '=='
const progressArrow = '>>'
const progressContent = []

program.version('0.0.4')

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
  .description('Create Project Through Exist Template')
  .action(() => {
    let projectName = 'your-project'
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
          message: 'Project Description: '
        },
        {
          type: 'input',
          name: 'author',
          message: 'Project Author: '
        }
      ])
      .then((answers) => {
        templateName = answers.template

        const timer = setInterval(() => {
          console.log(chalk.cyanBright([ '[', ...progressContent, progressArrow, ']' ].join('')))
          progressContent.push(progressBar)
        }, 1000)

        const { downloadUrl } = templates.find((template) => templateName === template.name)
        download(downloadUrl, projectName, { clone: true }, (err) => {
          clearInterval(timer)

          if (err) {
            console.log(chalk.red('Template Downloaded Failed'))
            process.exit(0)
          }

          const packagePath = `${projectName}/package.json`
          const packageContent = fs.readFileSync(packagePath, 'utf8')
          const packageResult = handlebars.compile(packageContent)(answers)
          fs.writeFileSync(packagePath, packageResult)
          console.log(chalk.blueBright('Get Initial Template Success'))
        })
      })
      .catch((err) => {
        console.log(chalk.red('Create New Project Failed: ' + err))
        process.exit(0)
      })
  })

program.parse(process.argv)
