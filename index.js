(function () {
  const INDEX_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users'
  const SHOW_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/'
  const data = []
  const dataPanel = document.getElementById('data-panel')
  const modalName = document.getElementById('show-user-name')
  const modalAvatar = document.getElementById('show-user-avatar')
  const modalDetail = document.getElementById('show-user-detail')
  const userModal = document.getElementById('show-user-modal')
  const ITEM_PER_PAGE = 12
  const pagination = document.getElementById('pagination')
  const navBar = document.querySelector('.navbar')
  const favorList = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  let paginationData = []
  let allPages

  //串接api並顯示用戶卡片
  axios.get(INDEX_URL)
    .then(res => {
      data.push(...res.data.results)
      allPages = Math.ceil(data.length / ITEM_PER_PAGE)
      getAllPages(data)
      getPageData(1, data)
    })
    .catch(err => console.log(err))


  navBar.addEventListener('click', event => {
    if (event.target.matches('.navbar-brand') || event.target.matches('.nav-home-btn')) {
      getAllPages(data)
      getPageData(1, data)
    } else if (event.target.matches('.nav-fav-btn')) {
      displayUserList(favorList)
      getFlag()
      showFavorIcon()
      favPageEmpty()
      //favorite 頁碼沒做 先隱藏
      for (let i = 1; i <= allPages; i++) {
        pagination.querySelectorAll(`[data-page="${i}"]`).forEach(item => item.parentElement.classList.add('d-none'))
      }
    }
  })

  function favPageEmpty() {
    if (favorList.length === 0) {
      let htmlContent = `
         <div>
         Empty
         </div> 
        `
      dataPanel.innerHTML = htmlContent
    };
  }



  //渲染主頁資料
  function displayUserList(data) {
    let htmlContent = ''
    data.forEach(item => {
      htmlContent += `
         <div class="user-card col-8 col-sm-6 col-md-4 col-lg-3">
          <div class="card mb-2">
          <i id='star-btn' class="fas fa-star d-none text-right" style="color:#FFDF00;" data-id="${item.id}"></i>
             <img class="user-avatar card-img-top rounded-circle ${item.gender}" src="${item.avatar}" alt="Card image cap">
             <div class="card-body user-item-body">
               <p class="card-title text-center btn-show-id" data-toggle="modal" data-target="#show-user-modal" data-id="${item.id}">${item.name}</p>
               <p class="card-id d-none">${item.id}</p>
               <p class="card-text text-center btn-show-region" data-id="${item.id}"><img id="flag" class='mr-2' src="" style="width: 20px; height: 15px">${item.region}</p>
               <p class="gender-age text-center" data-id="${item.id}"><i class="fas fa-${item.gender} mr-2"></i>${item.age} years old</p>
             </div>
           </div>
         </div> 
        `
    });
    dataPanel.innerHTML = htmlContent
  }


  //點擊名字秀出細部資訊
  dataPanel.addEventListener('click', event => {
    if (event.target.matches('.btn-show-id')) {
      //先清空modal前一筆資料
      modalAvatar.innerHTML = ''
      modalDetail.innerHTML = ''
      showInfo(event.target.dataset.id)
    } else if (event.target.matches('.fa-star')) {
      const starIcon = event.target.parentElement.querySelector('.fa-star')
      starIcon.classList.add('d-none')
      reomveFavoriteUser(event.target.dataset.id)
    }
  })


  // 在modal監聽add-btn
  userModal.addEventListener('click', event => {
    if (event.target.matches('.add-btn')) {
      const showUserId = event.target.parentElement.parentElement.querySelector('#show-user-id')
      let id = showUserId.textContent
      addFavoriteUser(id)
      showFavorIcon()
    }
  })


  function addFavoriteUser(id) {
    const user = data.find(item => item.id === Number(id))

    if (favorList.some(item => item.id === Number(id))) {
      alert(`${user.name} is already in your favorite list !`)
    } else {
      favorList.push(user)
      alert(`Added ${user.name} to your favorite list !`)
    }
    localStorage.setItem('favoriteUsers', JSON.stringify(favorList))
  }


  //移除星星用戶
  function reomveFavoriteUser(id) {
    const user = favorList.find(item => item.id === Number(id))
    const index = favorList.findIndex(item => item.id === Number(id))
    if (index === -1) return

    alert(`${user.name} is already removed from your favorite list !`)
    favorList.splice(index, 1)
    localStorage.setItem('favoriteUsers', JSON.stringify(favorList))
  }


  //有在favorList中的用戶加上星星
  function showFavorIcon() {
    for (let item of dataPanel.querySelectorAll('.user-card')) {
      if (favorList.some(user => user.id === Number(item.querySelector('.card-id').textContent))) {
        item.querySelector('.fa-star').classList.remove('d-none')
      } else {
        item.querySelector('.fa-star').classList.add('d-none')
      }
    }
  }


  //查詢國旗
  function getFlag() {
    for (let item of dataPanel.querySelectorAll('.user-card')) {
      let regionName = item.querySelector('.card-text').textContent
      let url = 'https://restcountries.eu/rest/v2/name/'
      axios.get(url + regionName)
        .then(res => {
          item.querySelector('#flag').src = (res.data[0].flag)
        })
        .catch(err => console.log(err))
    }
  }


  //根據id抓取用戶資料並渲染
  function showInfo(id) {
    const url = SHOW_URL + id
    axios.get(url)
      .then(res => {
        const data = res.data
        modalName.textContent = `Know more about this user`
        modalAvatar.innerHTML = `<img src="${data.avatar}" class=" img-fluid rounded-circle" alt="Responsive image">`
        modalDetail.innerHTML = `
          <h4 class="col-sm-12 modal-user-name text-center">${data.name} ${data.surname}</h4>
          <div class="modal-user-info modal-user-${data.gender}">
            <i class="list-group-item d-none" id="show-user-id">${data.id}</i>
            <i class="fas fa-map-marker-alt"> &nbsp;&nbsp; ${data.region}</i><br>
            <i class="fas fa-birthday-cake"> &nbsp;&nbsp; ${data.birthday}</i><br>
            <i class="fas fa-envelope"> &nbsp;&nbsp; ${data.email}</i>    
          </div>  
        `
      })
      .catch(err => console.log(err))
  }

  //計算頁碼並載入所有分頁
  function getAllPages(data) {

    let pageItemContent = `
          <li class="page-item">
            <a id="last-page" class="page-link" href="javascript:;" data-page="0">上一頁</a>
          </li>
          <li class="page-item">
            <a class="page-link" href="javascript:;" data-page="1">1</a>
          </li>
         `

    for (let i = 1; i < allPages; i++) {
      pageItemContent += `
          <li class="page-item">
            <a class="page-link" href="javascript:;" data-page="${i + 1}">${i + 1}</a>
          </li>
        `
    }
    pageItemContent += `
          <li class="page-item">
            <a id="next-page" class="page-link" href="javascript:;" data-page="0">下一頁</a>
          </li>
         `
    pagination.innerHTML = pageItemContent
  }


  function updatePageStatus(selectPage, data) {
    selectPage = Number(selectPage)

    //每點一頁就移除全部的active效果
    const paginationList = pagination.querySelectorAll('.page-item')
    paginationList.forEach(item => item.classList.remove('active'))

    //所在頁籤加上active效果
    pagination.querySelectorAll(`[data-page="${selectPage}"]`).forEach(item => item.parentElement.classList.add('active'))

    //移除last-page next-page active 效果
    const lastPage = document.getElementById('last-page')
    const nextPage = document.getElementById('next-page')
    lastPage.parentElement.classList.remove('active')
    nextPage.parentElement.classList.remove('active')

    //上一頁 下一頁 功能
    pagination.querySelector('#last-page').dataset.page = Number(selectPage) - 1
    pagination.querySelector('#next-page').dataset.page = Number(selectPage) + 1

    //在首頁時隱藏上一頁 在末頁時隱藏下一頁
    if (selectPage === allPages) {
      nextPage.parentElement.classList.add('d-none')
    } else if (selectPage === 1) {
      lastPage.parentElement.classList.add('d-none')
    } else {
      nextPage.parentElement.classList.remove('d-none')
      lastPage.parentElement.classList.remove('d-none')
    }

    //只顯示10個分頁
    const pageAmount = 10

    for (let i = 1; i <= allPages; i++) {
      pagination.querySelectorAll(`[data-page="${i}"]`).forEach(item => item.parentElement.classList.add('d-none'))
    }

    if (selectPage < Math.ceil(pageAmount / 2) + 1) {
      for (let i = 1; i <= pageAmount; i++) {
        pagination.querySelectorAll(`[data-page="${i}"]`).forEach(item => item.parentElement.classList.remove('d-none'))
      }
    } else if (selectPage < allPages - Math.ceil(pageAmount / 2))
      for (let i = selectPage - Math.ceil(pageAmount / 2);
        i < selectPage + Math.ceil(pageAmount / 2); i++) {
        pagination.querySelectorAll(`[data-page="${i}"]`).forEach(item => item.parentElement.classList.remove('d-none'))
      } else {
      for (let i = allPages - pageAmount + 1; i <= allPages; i++) {
        pagination.querySelectorAll(`[data-page="${i}"]`).forEach(item => item.parentElement.classList.remove('d-none'))
      }
    }
  }


  // listen to pagination click event
  pagination.addEventListener('click', event => {
    console.log(event.target)
    if (event.target.tagName === 'A') {
      getPageData(event.target.dataset.page)
    }
  })

  // 取出特定頁面的資料
  function getPageData(pageNum, data) {
    paginationData = data || paginationData
    let offset = (pageNum - 1) * ITEM_PER_PAGE
    let pageData = paginationData.slice(offset, offset + ITEM_PER_PAGE)
    displayUserList(pageData)
    getFlag()
    showFavorIcon()
    updatePageStatus(pageNum, data)
  }

})()