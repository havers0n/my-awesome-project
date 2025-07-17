import express from 'express';
import {
  getUserMonetization,
  getOrganizationMonetization,
  updateSubscriptionSettings,
  cancelSubscription,
  getSavingsPercentageDetails,
  getPayPerUseDetails
} from '../controllers/monetizationController';
import { rbacMiddleware } from '../middleware/rbacMiddleware';

const router = express.Router();

// Get monetization details for the current user's organization
router.get('/me/monetization', rbacMiddleware(['admin', 'owner', 'employee']), getUserMonetization);

// Get monetization details for a specific organization (admin only)
router.get('/organizations/:organizationId/monetization', 
  rbacMiddleware(['admin', 'superadmin']), 
  getOrganizationMonetization
);

// Update subscription settings
router.put('/monetization/subscription/:subscriptionId', 
  updateSubscriptionSettings
);

// Cancel subscription
router.post('/monetization/subscription/:subscriptionId/cancel', 
  cancelSubscription
);

// Get savings percentage details
router.get('/monetization/savings', getSavingsPercentageDetails);

// Get pay-per-use details
router.get('/monetization/pay-per-use', getPayPerUseDetails);

export default router;