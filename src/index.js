#!/usr/bin/env node

const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const Table = require('cli-table')
const program = require('commander')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const logSymbols = require('log-symbols')
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

program.version('0.0.1')

program
  .command('new <projectName>')
  .description('Create Project Through Exist Template')
  .action((projectName) => {
    let templateName = ''
    let templateNames = []

    templates.forEach((template) => {
      templateNames.push(template.name)
    })

    inquirer
      .prompt([
        {
          type: 'list',
          name: 'name',
          message: 'Choose A Template That You Want',
          choices: templateNames
        }
      ])
      .then((option) => {
        templateName = option.name

        const spinner = ora('Template Is Downloading')
        spinner.start()

        const { downloadUrl } = templates.find((template) => templateName === template.name)
        download(downloadUrl, projectName, { clone: true }, (err) => {
          if (err) {
            spinner.fail('Template Downloads Failed')
            console.log(logSymbols.error, chalk.red('Template Downloaded Failed'))
            process.exit(0)
          }

          spinner.succeed('Template Downloads Success')

          inquirer
            .prompt([
              {
                type: 'input',
                name: 'name',
                message: 'Project Name:',
                default: projectName
              },
              {
                type: 'input',
                name: 'description',
                message: 'Project Description:'
              },
              {
                type: 'input',
                name: 'author',
                message: 'Project Author:'
              }
            ])
            .then((answers) => {
              const packagePath = `${projectName}/package.json`
              const packageContent = fs.readFileSync(packagePath, 'utf8')
              const packageResult = handlebars.compile(packageContent)(answers)
              fs.writeFileSync(packagePath, packageResult)
              console.log(logSymbols.success, chalk.yellow('Get Initial Template Success'))
            })
            .catch((err) => {
              console.log(logSymbols.error, chalk.red('Get Initial Template Failed: ' + err))
              process.exit(0)
            })
        })
      })
      .catch((err) => {
        console.log(logSymbols.error, chalk.red('Create New Project Failed: ' + err))
        process.exit(0)
      })
  })

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

program.parse(process.argv)
