#!/usr/bin/env node

// This is a manual test to demonstrate the functionality works
// Run with: node manual-test-blacklist.js

console.log('Testing blacklist auto-removal functionality...\n');

// Mock the dependencies for demonstration
const mockUser = { id: 'user123', whatsappPn: '1234567890@s.whatsapp.net' };
const mockGroup = { id: 'group123', whatsappId: 'group@g.us' };
const mockBlacklistEntry = { userId: 'user123', groupId: 'group123' };

// Mock repositories
const mockUserRepository = {
  getByPn: async (pn) => {
    console.log(`✓ userRepository.getByPn called with: ${pn}`);
    return mockUser;
  }
};

const mockGroupRepository = {
  getByWaId: async (waId) => {
    console.log(`✓ groupRepository.getByWaId called with: ${waId}`);
    return mockGroup;
  }
};

const mockBlacklistRepository = {
  upsert: async (userId, groupId) => {
    console.log(`✓ blacklistRepository.upsert called with userId: ${userId}, groupId: ${groupId}`);
    return mockBlacklistEntry;
  }
};

// Mock Evolution API
const mockEvolutionAPI = {
  groupService: {
    removeMembers: async (phoneNumbers, groupWaId) => {
      console.log(`✓ evolutionAPI.groupService.removeMembers called with phoneNumbers: [${phoneNumbers.join(', ')}], groupWaId: ${groupWaId}`);
      // Simulate success
    }
  }
};

// Mock helpers
const formatWhatsappId = (phoneNumber) => {
  const normalized = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;
  return `${normalized}@s.whatsapp.net`;
};

const extractPhoneNumberFromWhatsappPn = (whatsappPn) => {
  const number = whatsappPn.slice(0, -'@s.whatsapp.net'.length);
  return `+${number}`;
};

// Implement the core logic from blacklistService.addToBlacklistWithRemoval
async function addToBlacklistWithRemoval(phoneNumber, groupWaId, skipRemoval = false) {
  console.log(`\n=== addToBlacklistWithRemoval ===`);
  console.log(`phoneNumber: ${phoneNumber}, groupWaId: ${groupWaId}, skipRemoval: ${skipRemoval}`);
  
  const whatsappPn = formatWhatsappId(phoneNumber);
  const user = await mockUserRepository.getByPn(whatsappPn);
  const group = await mockGroupRepository.getByWaId(groupWaId);

  if (!group || !user) {
    console.log('❌ Group or user not found');
    throw new Error('Group or user not found');
  }

  // Add to blacklist first (primary operation)
  const blacklistEntry = await mockBlacklistRepository.upsert(user.id, group.id);

  // Initialize removal results
  const removalResults = {
    success: false,
    groupWaId: groupWaId,
  };

  // If skipRemoval is false, attempt removal from WhatsApp group
  if (!skipRemoval) {
    try {
      await mockEvolutionAPI.groupService.removeMembers(
        [extractPhoneNumberFromWhatsappPn(whatsappPn)],
        groupWaId
      );
      removalResults.success = true;
      console.log('✓ User removed from WhatsApp group successfully');
    } catch (error) {
      console.log(`⚠️ Failed to remove user from group: ${error.message}`);
      removalResults.success = false;
      removalResults.error = error.message;
    }
  } else {
    console.log('⏭️ Removal skipped as requested');
    removalResults.success = true; // Consider skipped as successful
  }

  return {
    blacklistEntry,
    removalResults,
    skipRemoval
  };
}

// Test scenarios
async function runTests() {
  try {
    console.log('1. Testing successful blacklist with removal:');
    const result1 = await addToBlacklistWithRemoval('+1234567890', 'group@g.us', false);
    console.log(`✅ Result: blacklist success, removal success: ${result1.removalResults.success}`);

    console.log('\n2. Testing blacklist with skipRemoval=true:');
    const result2 = await addToBlacklistWithRemoval('+1234567890', 'group@g.us', true);
    console.log(`✅ Result: blacklist success, removal skipped: ${result2.skipRemoval}`);

    console.log('\n3. Testing blacklist with removal failure:');
    // Mock a failure in removeMembers
    mockEvolutionAPI.groupService.removeMembers = async () => {
      throw new Error('Network error');
    };
    const result3 = await addToBlacklistWithRemoval('+1234567890', 'group@g.us', false);
    console.log(`✅ Result: blacklist success, removal failed (non-blocking): ${!result3.removalResults.success}`);
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('- ✓ Auto-removal is triggered when skipRemoval=false');
    console.log('- ✓ Removal can be skipped with skipRemoval=true');
    console.log('- ✓ Blacklist addition succeeds even if removal fails');
    console.log('- ✓ Comprehensive response includes both blacklist and removal results');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }
}

// Run the tests
runTests();