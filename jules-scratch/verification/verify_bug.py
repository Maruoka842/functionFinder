from playwright.sync_api import sync_playwright, Page, expect

def run_test(page: Page):
    """
    This test attempts to reproduce the bug reported by the user.
    """
    # 1. Arrange: Go to the application homepage with the user's parameters.
    sequence = "0, 1, 0, 2, 0, 14, 0, 204, 0, 5104, 0, 195040, 0, 570386, 0, 168983, 0, 671563, 0, 226455, 0, 272519, 0, 603129, 0, 298609, 0, 841256, 0, 663822, 0, 476977, 0, 574167, 0, 318955, 0, 57566, 0, 387157"
    degree = "3"
    extend_length = "20"

    url = f"http://localhost:5173/?sequence={sequence}&degree={degree}&extendLength={extend_length}"
    page.goto(url)

    # 2. Act: Click the button to trigger the calculation.
    find_button = page.get_by_role("button", name="Find The Recurrence")
    find_button.click()

    # 3. Assert: Check for the "Algebraic Differential Equation for EGF" result.
    result_locator = page.locator(".alert-info:has-text('Algebraic Differential Equation for EGF')")

    expect(result_locator).to_be_visible(timeout=30000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/bug_repro.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_test(page)
        browser.close()
