function changeNavigation(clickedElement) {
    const links = document.getElementsByClassName('navigation-link')
    for (const link of links) {
        link.classList.remove('navigation-active')
    }
    clickedElement.classList.add('navigation-active')
}