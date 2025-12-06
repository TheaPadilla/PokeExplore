import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Alert
} from 'react-native';

// ERROR FIX: Removed the import for @expo/vector-icons
// import { Ionicons } from '@expo/vector-icons';

const FeedScreen = () => {
  const [posts, setPosts] = useState([
    {
      id: '1',
      username: 'Ash Ketchum',
      avatar: 'https://img.icons8.com/color/96/ash-ketchum.png',
      content: 'Just caught Mewtwo in Tokyo! The AR mode was intense! 😰',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
      timestamp: '2 hrs ago',
      likes: 42,
      comments: 8,
      liked: false,
    },
    {
      id: '2',
      username: 'Prof_Oak',
      avatar: 'https://img.icons8.com/color/96/professor-oak.png',
      content: 'Rare Dragonite spotted in NYC! Get your PokeBalls ready trainers.',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png',
      timestamp: '5 hrs ago',
      likes: 128,
      comments: 24,
      liked: true,
    },
    {
      id: '3',
      username: 'Misty_Water',
      avatar: 'https://img.icons8.com/color/96/misty.png',
      content: 'Look at this cute Psyduck I found near the gym! 🦆',
      image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png',
      timestamp: '1 day ago',
      likes: 15,
      comments: 3,
      liked: false,
    },
  ]);

  const [newPostText, setNewPostText] = useState('');

  const handleLike = (id) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handlePost = () => {
    if (!newPostText.trim()) return;

    const newPost = {
      id: Date.now().toString(),
      username: 'Trainer Alex',
      avatar: 'https://img.icons8.com/color/96/pokeball-2.png',
      content: newPostText,
      image: null,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      liked: false,
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    Alert.alert('Success', 'Posted to Global Feed! 🌍');
  };

  const renderPost = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.timestamp}>{item.timestamp}</Text>
        </View>
      </View>

      <Text style={styles.postText}>{item.content}</Text>
      {item.image && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.postImage} />
          <View style={styles.arBadge}>
             <Text style={styles.arBadgeText}>AR SNAPSHOT</Text>
          </View>
        </View>
      )}

      <View style={styles.cardFooter}>
        {/* FIX: Replaced Ionicons with Text Emojis */}
        <TouchableOpacity
          style={styles.interactionBtn}
          onPress={() => handleLike(item.id)}
        >
          <Text style={{ fontSize: 20 }}>{item.liked ? "❤️" : "🤍"}</Text>
          <Text style={[styles.interactionText, item.liked && styles.likedText]}>
            {item.likes}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionBtn}>
          <Text style={{ fontSize: 18 }}>💬</Text>
          <Text style={styles.interactionText}>{item.comments}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.interactionBtn}>
          <Text style={{ fontSize: 18 }}>🔗</Text>
          <Text style={styles.interactionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>🌍 GLOBAL FEED</Text>
      </View>

      <View style={styles.inputContainer}>
        <Image
          source={{ uri: 'https://img.icons8.com/color/96/pokeball-2.png' }}
          style={styles.inputAvatar}
        />
        <TextInput
          style={styles.input}
          placeholder="Share your discovery..."
          placeholderTextColor="#6b7280"
          value={newPostText}
          onChangeText={setNewPostText}
        />
        <TouchableOpacity style={styles.postBtn} onPress={handlePost}>
          {/* FIX: Replaced Send Icon with Emoji */}
          <Text style={{ fontSize: 16 }}>➤</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={posts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  screenHeader: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#1f2937',
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  screenTitle: {
    color: '#fbbf24',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#374151',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  postBtn: {
    backgroundColor: '#3b82f6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  card: {
    backgroundColor: '#1f2937',
    marginBottom: 15,
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    fontFamily: 'monospace',
  },
  timestamp: {
    color: '#9ca3af',
    fontSize: 10,
  },
  postText: {
    color: '#d1d5db',
    fontSize: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    lineHeight: 20,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000',
    position: 'relative',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  arBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  arBadgeText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    justifyContent: 'space-between',
  },
  interactionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    color: '#9ca3af',
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  likedText: {
    color: '#ef4444',
  }
});

export default FeedScreen;