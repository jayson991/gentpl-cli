#!/usr/bin/env node

const fs = require('fs')
const ora = require('ora')
const chalk = require('chalk')
const program = require('commander')
const inquirer = require('inquirer')
const handlebars = require('handlebars')
const logSymbols = require('log-symbols')
const download = require('download-git-repo')

const templates = require('../config/templates.json')

// -v || --version: check your package version
program.version('0.0.1')

program
  .command('init <template> <project>')
  .description('Get Initial Template')
  .action((templateName, projectName) => {
    const spinner = ora('Template Downloading...')
    spinner.start()

    const { downloadUrl } = templates.find((template) => templateName === template.name)
    download(downloadUrl, projectName, { clone: true }, (err) => {
      if (err) {
        spinner.fail('Template Downloaded Failed')
        console.log(logSymbols.error, chalk.red('Template Downloaded Failed:' + err))
        return false
      }

      spinner.succeed('Template Downloaded Success')

      // Change Your Package Info
      inquirer
        .prompt([
          {
            type: 'input',
            name: 'name',
            message: 'Project Name: '
          },
          {
            type: 'input',
            name: 'description',
            message: 'Project Description: '
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

program
  .command('list')
  .description('List All Templates')
  .action(() => {
    let templateList = []
    templates.forEach((template) => {
      const listItem = {
        templateName: template.name,
        description: template.description
      }
      
      templateList.push(listItem)
    })
    console.table(templateList)
  })

program.parse(process.argv)
