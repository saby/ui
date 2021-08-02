@Library('pipeline') _

def version = '21.3100'

node ('controls') {
    checkout_pipeline("21.3100/pea/fix-start-ui")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('ui', version)
}