
describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow a user to filter, add an out-of-stock record, and see the table refresh', () => {
    // 1. Filter the table
    cy.get('[data-testid="filter-input"]').type('In Stock');
    cy.get('[data-testid="filter-button"]').click();
    cy.get('[data-testid="dashboard-table"]').should('contain', 'In Stock');

    // 2. Add a new out-of-stock record
    cy.get('[data-testid="add-record-button"]').click();
    cy.get('[data-testid="product-name-input"]').type('New Product');
    cy.get('[data-testid="status-select"]').select('Out of Stock');
    cy.get('[data-testid="submit-button"]').click();

    // 3. Verify the table refreshes and contains the new record
    cy.get('[data-testid="dashboard-table"]').should('contain', 'New Product');
  });
});

