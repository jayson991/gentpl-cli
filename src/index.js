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
  .command('new <app-name>')
  .description('Create Project Through Exist Template')
  .action((projectName) => {
    let templateName = ''

    inquirer
      .prompt([
        {
          type: 'rawlist',
          name: 'name',
          message: 'Choose A Template: ',
          choices: [ 'react-template', 'react-typescript-template' ]
        }
      ])
      .then((option) => {
        templateName = option.name

        const spinner = ora('Template Downloads ...')
        spinner.start()

        const { downloadUrl } = templates.find((template) => templateName === template.name)
        download(downloadUrl, projectName, { clone: true }, (err) => {
          if (err) {
            spinner.fail('Template Downloads Failed')
            console.log(logSymbols.error, chalk.red('Template Downloaded Failed:' + err))
            return false
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
        })
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
