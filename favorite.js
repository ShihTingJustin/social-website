(function () {
  const INDEX_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users'
  const SHOW_URL = 'https://lighthouse-user-api.herokuapp.com/api/v1/users/'
  const data = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const dataPanel = document.getElementById('data-panel')
  const userCard = dataPanel.querySelectorAll('.user-card')

  const modalName = document.getElementById('show-user-name')
  const modalAvatar = document.getElementById('show-user-avatar')
  const modalDetail = document.getElementById('show-user-detail')
  const starBtn = document.getElementById('star-btn')
  const ITEM_PER_PAGE = 12
  const pagination = document.getElementById('pagination')
  let paginationData = []

  displayUserList(data)
  showFavorIcon()
  getFlag()

  //渲染主頁資料
  function displayUserList(data) {
    let htmlContent = ''
    data.forEach(item => {
      htmlContent += `
         <div class="user-card col-sm-3">
          <div class="card mb-2">
             <img class="user-avatar card-img-top rounded-circle ${item.gender}" src="${item.avatar}" alt="Card image cap">
             <div class="card-body user-item-body">
               <p class="card-title text-center btn-show-id" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">${item.name}</p>
               <p class="card-text text-center"><img id="flag" class='mr-2' src="" style="width: 20px; height: 15px">${item.region}</p>
               <p class="gender-age text-center"><i class="fas fa-${item.gender} mr-2"></i>${item.age} years old</p>
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
    }
  })


  function addFavoriteUser(id) {
    const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
    const user = data.find(item => item.id === Number(id))

    if (list.some(item => item.id === Number(id))) {
      alert(`${user.name} is already in your favorite list !`)
    } else {
      list.push(user)
      alert(`Added ${user.name} to your favorite list !`)
    }
    localStorage.setItem('favoriteUsers', JSON.stringify(list))


  }


  //查詢國旗
  function getFlag() {
    for (let item of userCard) {
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
        modalAvatar.innerHTML = `<img src="${data.avatar}" class="img-fluid rounded-circle" alt="Responsive image">`
        modalDetail.innerHTML = `
          <h4 class="col-sm-12">${data.name} ${data.surname}</h4>
          <div class="userInfo">
            <i class="fas fa-map-marker-alt"> &nbsp;&nbsp; ${data.region}</i><br>
            <i class="fas fa-birthday-cake"> &nbsp;&nbsp; ${data.birthday}</i><br>
            <i class="fas fa-envelope"> &nbsp;&nbsp; ${data.email}</i>    
          </div>  
        `
      })
      .catch(err => console.log(err))
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

})()