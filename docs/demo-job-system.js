#!/usr/bin/env node

/**
 * Demo script to test the cancellable job system
 *
 * This script demonstrates:
 * 1. Starting a dry-run job
 * 2. Monitoring its status
 * 3. Cancelling a job mid-execution
 * 4. Listing all jobs
 *
 * Note: This requires the server to be running on http://localhost:3000
 * and a valid group WaId in the database.
 */

const BASE_URL = 'http://localhost:3000';

// Mock group ID - replace with a real one from your database
const TEST_GROUP_ID = '120363403645737238@g.us';

async function makeRequest(method, path, body = null) {
	const url = `${BASE_URL}${path}`;
	const options = {
		method,
		headers: {
			'Content-Type': 'application/json',
		},
	};

	if (body) {
		options.body = JSON.stringify(body);
	}

	try {
		const response = await fetch(url, options);
		const data = await response.json();
		return { status: response.status, data };
	} catch (error) {
		console.error(`Error making ${method} request to ${path}:`, error.message);
		throw error;
	}
}

async function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

async function demo() {
	console.log('=== Cancellable Job System Demo ===\n');

	// 1. Start a dry-run workflow job
	console.log('1. Starting a dry-run workflow job...');
	const startResult = await makeRequest('POST', '/admin/jobs/start', {
		type: 'removal_workflow',
		groupWaId: TEST_GROUP_ID,
		batchSize: 5,
		delayMs: 10000,
		dryRun: true,
		inactivityWindowMs: 2592000000, // 30 days
	});

	console.log(`   Status: ${startResult.status}`);
	console.log(`   Response:`, startResult.data);
	const jobId = startResult.data.jobId;
	console.log();

	// 2. Check job status
	console.log('2. Checking job status...');
	await sleep(2000); // Wait 2 seconds
	const statusResult = await makeRequest('GET', `/admin/jobs/${jobId}/status`);
	console.log(`   Status: ${statusResult.status}`);
	console.log(`   Job Status:`, statusResult.data.status);
	console.log(`   Progress:`, statusResult.data.progress);
	console.log();

	// 3. List all jobs
	console.log('3. Listing all jobs...');
	const listResult = await makeRequest('GET', '/admin/jobs');
	console.log(`   Status: ${listResult.status}`);
	console.log(`   Total jobs: ${listResult.data.length}`);
	console.log();

	// 4. List running jobs
	console.log('4. Listing running jobs...');
	const runningResult = await makeRequest('GET', '/admin/jobs?status=running');
	console.log(`   Status: ${runningResult.status}`);
	console.log(`   Running jobs: ${runningResult.data.length}`);
	console.log();

	// 5. Cancel the job
	console.log('5. Cancelling the job...');
	const cancelResult = await makeRequest('POST', `/admin/jobs/${jobId}/cancel`);
	console.log(`   Status: ${cancelResult.status}`);
	console.log(`   Response:`, cancelResult.data);
	console.log();

	// 6. Check final status
	console.log('6. Checking final job status...');
	await sleep(1000);
	const finalStatusResult = await makeRequest(
		'GET',
		`/admin/jobs/${jobId}/status`
	);
	console.log(`   Status: ${finalStatusResult.status}`);
	console.log(`   Job Status:`, finalStatusResult.data.status);
	console.log();

	console.log('=== Demo Complete ===');
}

// Run the demo
demo().catch((error) => {
	console.error('Demo failed:', error);
	process.exit(1);
});
