@Library('pipeline') _

def version = '21.4100'

node ('controls') {
    checkout_pipeline("21.4100/pea/revert_generate")
    run_branch = load '/home/sbis/jenkins_pipeline/platforma/branch/run_branch'
    run_branch.execute('ui', version)
}