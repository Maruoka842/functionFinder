from playwright.sync_api import sync_playwright, Page

def run_test(page: Page):
    """
    This test verifies the initial layout of the page.
    """
    page.goto("http://localhost:5173/")
    page.screenshot(path="jules-scratch/verification/layout_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        import subprocess
        import atexit

        server = subprocess.Popen(["npm", "run", "dev"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        atexit.register(server.kill)

        import time
        time.sleep(5)

        try:
            run_test(page)
            print("Layout verification screenshot captured.")
        except Exception as e:
            print(f"Verification failed: {e}")
            page.screenshot(path="jules-scratch/verification/layout_verification_failure.png")
            exit(1)
        finally:
            browser.close()
