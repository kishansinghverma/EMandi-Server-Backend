import simpleGit from 'simple-git';
import cron from 'node-cron';

const CommitProduction = () => {
    const git = simpleGit();
    git.add('.')
        .then(() => (git.commit(`Production Commit @ ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`)))
        .then(() => console.log('Commit successful!'))
        .then(()=>(git.pull()))
        .then(result => {
            console.log(result?.summary?.changes ?'Pull successful!' : 'Already up to date.');
            return git.push();
        })
        .then(() => console.log('Push successful!'))
        .catch((error) => console.error('Commit failed:', error));
}

export const RegisterCronJobs = () => {
    console.log('Registering Cron Jobs...');
    cron.schedule('30 19 * * *', () => {
        CommitProduction();
    });
}