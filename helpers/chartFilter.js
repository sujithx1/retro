function getStartDate(interval) {
    // Get the current date
    const currentDate = new Date();

    // Initialize variables to store start date
    let startDate;

    // Determine the start date based on the selected interval
    switch (interval) {
        case 'yearly':
            startDate = new Date(currentDate.getFullYear(), 0, 1); // First day of the current year
            break;
        case 'monthly':
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1); // First day of the current month
            break;
        case 'weekly':
        default:
            // Calculate the start date for the beginning of the current week (Sunday)
            const firstDayOfWeek = currentDate.getDate() - currentDate.getDay();
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), firstDayOfWeek);
            break;
    }

    return startDate;
}


module.exports=getStartDate