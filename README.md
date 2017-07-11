# Mailchimp Template Generator
Generate a custom responsive Mailchimp template that uses repeating and variable content blocks


## Local Development

### Setup
1. Clone This Repo: `git clone https://github.com/fordhamumc/mailchimp-templates.git`
2. Install Dependencies: `cd mailchimp-templates && npm install`
3. Start Development Server: `grunt serve`
4. Choose your template if there's more than one

### Directory

    ├── app
    │  ├── _components (each individual content type)
    │  ├── _layouts (header, footer, and basic styles)
    │  └── default (email template)
    │  │  ├── styles
    │  │  │  ├── default.css (styles that will be in the style tag in the head of the email)
    │  │  │  ├── default-editable (styles that will be editable within the Mailchimp message)
    │  │  │  └── default-inlined.pug (styles that will be inlined by premailer and not included in a style tag)
    │  │  ├── data-dev.json (development settings)
    │  │  ├── data-prod.json (prod settings)
    │  │  └── default.pug (template layout)
    ├── dist (generated template(s))


## Deployment

### Build
* `grunt build`
* `grunt build:clean` creates a version without the Mailchimp template code

### Add to Mailchimp
Follow the instructions on importing a ["Code your own" template.](http://kb.mailchimp.com/templates/code/import-a-custom-html-template)
