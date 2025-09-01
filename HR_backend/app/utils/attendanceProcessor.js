// app/utils/attendanceProcessor.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const processAttendanceForDate = async (date, employeeIds) => {
    const operations = [];
    
    for (const employeeId of employeeIds) {
        // Get all logs for this employee on this date
        const logs = await prisma.attendanceLog.findMany({
            where: {
                employeeId: employeeId,
                date: date
            }
        });

        // Determine status based on logs
        let status = 'absent';
        let lateArrival = false;
        let earlyDeparture = false;
        let unplannedAbsence = false;

        if (logs.length > 0) {
            const hasPresent = logs.some(log => log.status === 'present');
            const hasLate = logs.some(log => log.status === 'late');
            const hasPermission = logs.some(log => log.status === 'permission');

            if (hasPresent) {
                status = 'present';
            } else if (hasLate) {
                status = 'late';
                lateArrival = true;
            } else if (hasPermission) {
                status = 'permission';
            } else {
                unplannedAbsence = true;
            }

            // Check for early departure (if needed)
            // You can implement this logic based on your business rules
        }

        operations.push(
            prisma.attendanceSummary.upsert({
                where: {
                    employeeId_date: {
                        employeeId: employeeId,
                        date: date
                    }
                },
                update: {
                    status: status,
                    lateArrival: lateArrival,
                    earlyDeparture: earlyDeparture,
                    unplannedAbsence: unplannedAbsence
                },
                create: {
                    employeeId: employeeId,
                    date: date,
                    status: status,
                    lateArrival: lateArrival,
                    earlyDeparture: earlyDeparture,
                    unplannedAbsence: unplannedAbsence
                }
            })
        );
    }

    return operations;
};

module.exports = {
    processAttendanceForDate
};