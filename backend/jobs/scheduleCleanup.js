import cron from 'node-cron';
import scheduleModel from '../models/scheduleModel.js';

const startScheduleCleanupJob = () => {
    // Run exactly at 00:00 (midnight) every day
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running daily schedule cleanup job at midnight...');

            // Calculate the date 7 days ago
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            // Find and delete schedules where endTime is older than 7 days
            const result = await scheduleModel.deleteMany({
                endTime: { $lt: sevenDaysAgo }
            });

            console.log(`Schedule cleanup complete. Deleted ${result.deletedCount} old schedule(s).`);
        } catch (error) {
            console.error('Error during schedule cleanup job:', error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
};

export default startScheduleCleanupJob;
