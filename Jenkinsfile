@Library('pipeline') _

def version = '21.4000'

node ('controls') {
    checkout_pipeline("21.4000/feature/may/chrome-92-260721")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('ui', version)
}