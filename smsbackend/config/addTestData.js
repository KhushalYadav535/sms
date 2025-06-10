const pool = require('./db');

async function addTestData() {
  try {
    // Add test complaints
    const testComplaints = [
      {
        user_id: 1,
        title: 'Water Leakage',
        description: 'There is a water leakage in my bathroom',
        status: 'Pending'
      },
      {
        user_id: 1,
        title: 'Power Outage',
        description: 'No electricity in Block A for the last 2 hours',
        status: 'In Progress'
      },
      {
        user_id: 1,
        title: 'Garbage Collection',
        description: 'Garbage not being collected regularly',
        status: 'Resolved'
      },
      {
        user_id: 1,
        title: 'Security Issue',
        description: 'Suspicious activity near the main gate',
        status: 'Pending'
      },
      {
        user_id: 1,
        title: 'Parking Problem',
        description: 'Someone parked in my assigned spot',
        status: 'In Progress'
      }
    ];

    for (const complaint of testComplaints) {
      await pool.query(
        'INSERT INTO complaints (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        [complaint.user_id, complaint.title, complaint.description, complaint.status]
      );
    }

    console.log('Test data added successfully');
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    process.exit();
  }
}

addTestData(); 