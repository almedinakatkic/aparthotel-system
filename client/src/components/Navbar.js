import React, { useState, useRef, useEffect } from 'react';
import '../assets/styles/navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleUser, faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([
    'Beachfront apartments',
    'Downtown luxury suites',
    'Family rooms with kitchen',
    'Monthly rentals'
  ]);
  const [filterOption, setFilterOption] = useState('recent');
  const searchRef = useRef(null);

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      handleSearchSubmit(new Event('submit'));
    } else {
      setShowSearchDropdown(!showSearchDropdown);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (!recentSearches.includes(searchQuery)) {
        setRecentSearches([searchQuery, ...recentSearches].slice(0, 5));
      }
      console.log('Searching for:', searchQuery);
      setSearchQuery('');
      setShowSearchDropdown(false);
    }
  };

  const handleRecentSearchClick = (term) => {
    setSearchQuery(term);
    // You could perform the search immediately when clicking a recent term
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <span className="logo-text block">APARTHOTEL</span>
        <span className="logo-text-lowercase"><br/>Database Management System</span>
      </div>

      <div className="navbar-right-section">
        <div className="navbar-search-container" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-container">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search properties..."
                className="search-input"
                onFocus={() => setShowSearchDropdown(true)}
              />
              <button 
                type="button" 
                className="search-icon-button"
                onClick={handleSearchClick}
              >
                <FontAwesomeIcon icon={faSearch} className="search-icon" />
              </button>
              {searchQuery && (
                <button 
                  type="button" 
                  className="clear-search" 
                  onClick={() => setSearchQuery('')}
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              )}
            </div>
          </form>

          {showSearchDropdown && (
            <div className="search-dropdown">
              <div className="search-filter-options">
                <button 
                  className={`filter-btn ${filterOption === 'recent' ? 'active' : ''}`}
                  onClick={() => setFilterOption('recent')}
                >
                  Recent
                </button>
                <button 
                  className={`filter-btn ${filterOption === 'location' ? 'active' : ''}`}
                  onClick={() => setFilterOption('location')}
                >
                  By Location
                </button>
                <button 
                  className={`filter-btn ${filterOption === 'alphabetical' ? 'active' : ''}`}
                  onClick={() => setFilterOption('alphabetical')}
                >
                  A-Z
                </button>
              </div>

              <div className="recent-searches">
                <h4>Recent Searches</h4>
                <ul>
                  {recentSearches.map((search, index) => (
                    <li key={index} onClick={() => handleRecentSearchClick(search)}>
                      {search}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="navbar-profile">
          <FontAwesomeIcon icon={faCircleUser} className="profile-icon" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;