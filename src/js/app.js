App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  init: async function() {

    return await App.initWeb3();
  },

  initWeb3: async function() {
    /*
     * Replace me...
     */
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      // web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    console.log('initContract');
    $.getJSON("Election.json", function (election) {
      App.contracts.Election = TruffleContract(election);
      App.contracts.Election.setProvider(App.web3Provider);

      return App.render()
    })

    return App.bindEvents();
  },

  render: async function(){
    var electionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    web3.eth.getAccounts(function (err, accounts) {
      console.log('account', err, accounts);
      if (err === null){
        App.account = accounts[0];
        $("#accountAddress").html("Your Account: " + accounts[0]);
      }
    })

    // Load contract data
    App.contracts.Election.deployed().then(function (instance) {
      electionInstance = instance;
      return electionInstance.candidateCount();
    }).then(function (candidatesCount) {
      var candidatesResults = $("#candidatesResults");
      var candidatesSelect = $("#candidateSelect");
      candidatesResults.empty();

      for (var i = 1; i <= candidatesCount; i ++) {
        electionInstance.Candidates(i).then(function (candidate) {
          console.log('candidate', candidate);
          var id = candidate[0];
          var name = candidate[1];
          var voteCount = candidate[2];

          // Render
          var candidateTemplate = "<tr><th>" + id + "</th><th>" + name + "</th><th>" + voteCount + "</th></tr>"
          candidatesResults.append(candidateTemplate);

          var candidateOption = "<option value='" + id + "'>" + name + "</option>"
          candidatesSelect.append(candidateOption)

          return electionInstance.voters(App.account);
        })
      }

      return electionInstance.voters(App.account);
    }).then(function (hasVoted) {
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function (error) {
      console.warn(error);
    })
  },

  castVote: function(){
    var candidateId = $("#candidateSelect").val();
    App.contracts.Election.deployed().then(function (instance) {
      return instance.vote(candidateId, {from: App.account});
    }).then(function (result) {
      console.log('result', result);
      $("content").hide();
      $("#loader").show();
    })
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    /*
     * Replace me...
     */
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    /*
     * Replace me...
     */
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
