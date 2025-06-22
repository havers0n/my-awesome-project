import { Request, Response } from 'express';
import { pool } from '../db';

// Define types for database rows
interface MonetizationRow {
  monetization_type: string;
  monetization_details: any;
}

interface SubscriptionRow {
  planName: string;
  status: string;
  expiresAt: string;
  costPerPeriod: string;
  renewalDate: string;
}

interface SavingsRow {
  metricName: string;
  currentSavings: string;
  period: string;
  commissionRate: string;
  commissionAmount: string;
}

interface PayPerUseRow {
  period: string;
  usage: number;
  costPerUnit: string;
  totalCost: string;
}

/**
 * Get all monetization details for a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getUserMonetization = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const userOrgId = req.user.organization_id;

    // If user is not associated with an organization
    if (!userOrgId) {
      res.status(404).json({ error: 'User is not associated with any organization' });
      return;
    }

    // Get monetization agreements for the user's organization
    const result = await pool.query(
      `SELECT 
        oma.id, 
        oma.status, 
        oma.start_date, 
        oma.end_date, 
        oma.details,
        mmt.type_code,
        mmt.name as model_name,
        mmt.description as model_description
      FROM 
        organization_monetization_agreements oma
      JOIN 
        monetization_model_types mmt ON oma.model_type_id = mmt.id
      WHERE 
        oma.organization_id = $1
      ORDER BY 
        oma.created_at DESC`,
      [userOrgId]
    );

    // Format the response
    const monetizationDetails = result.rows.map(row => ({
      type: row.type_code,
      name: row.model_name,
      description: row.model_description,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      details: row.details
    }));

    res.json({ monetizationDetails });
  } catch (error) {
    console.error('Error fetching user monetization details:', error);
    res.status(500).json({ error: 'Failed to fetch monetization details' });
  }
};

/**
 * Get monetization details for a specific organization (admin only)
 * @param req - Express request object
 * @param res - Express response object
 */
export const getOrganizationMonetization = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userRole = req.user.role;
    const organizationId = parseInt(req.params.organizationId);

    // Check if user has permission to access this organization
    if (userRole !== 'admin' && userRole !== 'superadmin' && req.user.organization_id !== organizationId) {
      res.status(403).json({ error: 'You do not have permission to access this organization' });
      return;
    }

    // Get monetization agreements for the specified organization
    const result = await pool.query(
      `SELECT 
        oma.id, 
        oma.status, 
        oma.start_date, 
        oma.end_date, 
        oma.details,
        mmt.type_code,
        mmt.name as model_name,
        mmt.description as model_description
      FROM 
        organization_monetization_agreements oma
      JOIN 
        monetization_model_types mmt ON oma.model_type_id = mmt.id
      WHERE 
        oma.organization_id = $1
      ORDER BY 
        oma.created_at DESC`,
      [organizationId]
    );

    // Format the response
    const monetizationDetails = result.rows.map(row => ({
      type: row.type_code,
      name: row.model_name,
      description: row.model_description,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      details: row.details
    }));

    res.json({ monetizationDetails });
  } catch (error) {
    console.error('Error fetching organization monetization details:', error);
    res.status(500).json({ error: 'Failed to fetch monetization details' });
  }
};

/**
 * Update subscription settings for a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const updateSubscriptionSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const { subscriptionId, settings } = req.body;

    // Check if user has permission to update this subscription
    const checkResult = await pool.query(
      `SELECT oma.id 
       FROM organization_monetization_agreements oma
       JOIN users u ON oma.organization_id = u.organization_id
       WHERE u.id = $1 AND oma.id = $2`,
      [userId, subscriptionId]
    );

    if (checkResult.rows.length === 0) {
      res.status(403).json({ error: 'You do not have permission to update this subscription' });
      return;
    }

    // Update the subscription settings
    const result = await pool.query(
      `UPDATE organization_monetization_agreements
       SET details = details || $1::jsonb, updated_at = NOW()
       WHERE id = $2
       RETURNING id, details`,
      [JSON.stringify(settings), subscriptionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    res.json({
      message: 'Subscription settings updated successfully',
      subscription: {
        id: result.rows[0].id,
        details: result.rows[0].details
      }
    });
  } catch (error) {
    console.error('Error updating subscription settings:', error);
    res.status(500).json({ error: 'Failed to update subscription settings' });
  }
};

/**
 * Cancel a user's subscription
 * @param req - Express request object
 * @param res - Express response object
 */
export const cancelSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const { subscriptionId, reason } = req.body;

    // Check if user has permission to cancel this subscription
    const checkResult = await pool.query(
      `SELECT oma.id 
       FROM organization_monetization_agreements oma
       JOIN users u ON oma.organization_id = u.organization_id
       WHERE u.id = $1 AND oma.id = $2`,
      [userId, subscriptionId]
    );

    if (checkResult.rows.length === 0) {
      res.status(403).json({ error: 'You do not have permission to cancel this subscription' });
      return;
    }

    // Update the subscription status to INACTIVE
    const result = await pool.query(
      `UPDATE organization_monetization_agreements
       SET status = 'INACTIVE', 
           details = details || $1::jsonb, 
           updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, details`,
      [JSON.stringify({ cancellation_reason: reason, cancellation_date: new Date() }), subscriptionId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    res.json({
      message: 'Subscription cancelled successfully',
      subscription: {
        id: result.rows[0].id,
        status: result.rows[0].status,
        details: result.rows[0].details
      }
    });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
};

/**
 * Get savings percentage details for a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getSavingsPercentageDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const userOrgId = req.user.organization_id;

    // If user is not associated with an organization
    if (!userOrgId) {
      res.status(404).json({ error: 'User is not associated with any organization' });
      return;
    }

    // Get savings percentage agreement for the user's organization
    const result = await pool.query(
      `SELECT 
        oma.id, 
        oma.status, 
        oma.start_date, 
        oma.end_date, 
        oma.details
      FROM 
        organization_monetization_agreements oma
      JOIN 
        monetization_model_types mmt ON oma.model_type_id = mmt.id
      WHERE 
        oma.organization_id = $1 AND
        mmt.type_code = 'SAVINGS_PERCENTAGE'
      ORDER BY 
        oma.created_at DESC
      LIMIT 1`,
      [userOrgId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No savings percentage agreement found' });
      return;
    }

    res.json({
      savingsPercentage: result.rows[0].details.percentage || 0,
      status: result.rows[0].status,
      startDate: result.rows[0].start_date,
      endDate: result.rows[0].end_date,
      details: result.rows[0].details
    });
  } catch (error) {
    console.error('Error fetching savings percentage details:', error);
    res.status(500).json({ error: 'Failed to fetch savings percentage details' });
  }
};

/**
 * Get pay-per-use details for a user
 * @param req - Express request object
 * @param res - Express response object
 */
export const getPayPerUseDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    const userOrgId = req.user.organization_id;

    // If user is not associated with an organization
    if (!userOrgId) {
      res.status(404).json({ error: 'User is not associated with any organization' });
      return;
    }

    // Get pay-per-use agreement for the user's organization
    const result = await pool.query(
      `SELECT 
        oma.id, 
        oma.status, 
        oma.start_date, 
        oma.end_date, 
        oma.details
      FROM 
        organization_monetization_agreements oma
      JOIN 
        monetization_model_types mmt ON oma.model_type_id = mmt.id
      WHERE 
        oma.organization_id = $1 AND
        mmt.type_code = 'PAY_PER_USE'
      ORDER BY 
        oma.created_at DESC
      LIMIT 1`,
      [userOrgId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No pay-per-use agreement found' });
      return;
    }

    res.json({
      payPerUse: result.rows[0].details,
      status: result.rows[0].status,
      startDate: result.rows[0].start_date,
      endDate: result.rows[0].end_date
    });
  } catch (error) {
    console.error('Error fetching pay-per-use details:', error);
    res.status(500).json({ error: 'Failed to fetch pay-per-use details' });
  }
}; 