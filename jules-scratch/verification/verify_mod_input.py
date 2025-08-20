from playwright.sync_api import sync_playwright, Page, expect

def run_test(page: Page):
    """
    This test verifies that a user can input a custom modulus
    and see the results of the calculation.
    """
    # Capture console logs
    page.on('console', lambda msg: print(f"BROWSER LOG: {msg.text}"))
    page.on('pageerror', lambda err: print(f"PAGE ERROR: {err}"))

    # 1. Arrange: Go to the application homepage.
    # Assuming the dev server is running on localhost:5173
    page.goto("http://localhost:5173")

    # 2. Act: Find the "Mod" input field and enter a new value.
    mod_input = page.get_by_label("Mod:")
    expect(mod_input).to_be_visible()
    mod_input.fill("998244353")

    # Enter a sequence
    sequence_input = page.get_by_label("Enter a sequence (comma-separated):")
    expect(sequence_input).to_be_visible()
    sequence_input.fill("1, 2, 4, 8, 16")

    # Click the button
    find_button = page.get_by_role("button", name="Find The Recurrence")
    find_button.click()

    # 3. Assert: Wait for the results or an error to appear.
    result_locator = page.locator(".alert-info")
    error_locator = page.locator(".alert-danger")

    expect(result_locator.or_(error_locator).first).to_be_visible(timeout=10000)

    # 4. Screenshot: Capture the final result for visual verification.
    page.screenshot(path="jules-scratch/verification/verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        run_test(page)
        browser.close()
